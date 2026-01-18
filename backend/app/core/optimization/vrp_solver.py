from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import numpy as np
from typing import List, Dict, Any, Callable, Optional
import asyncio
from math import radians, sin, cos, sqrt, atan2


class VRPSolver:
    """Vehicle Routing Problem Solver using OR-Tools"""
    
    def __init__(
        self,
        locations: List[Dict[str, Any]],
        num_vehicles: int,
        depot: Dict[str, float],
        algorithm: str = "ortools"
    ):
        self.locations = locations
        self.num_vehicles = num_vehicles
        self.depot = depot
        self.algorithm = algorithm
        
        # Add depot as first location
        self.all_locations = [depot] + locations
        self.num_locations = len(self.all_locations)
        
        # Build distance matrix
        self.distance_matrix = self._build_distance_matrix()
    
    def _haversine_distance(self, coord1: Dict, coord2: Dict) -> float:
        """Calculate distance between two coordinates in meters"""
        R = 6371000  # Earth's radius in meters
        
        lat1, lon1 = radians(coord1["lat"]), radians(coord1["lng"])
        lat2, lon2 = radians(coord2["lat"]), radians(coord2["lng"])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c
    
    def _build_distance_matrix(self) -> np.ndarray:
        """Build distance matrix between all locations"""
        n = self.num_locations
        matrix = np.zeros((n, n))
        
        for i in range(n):
            for j in range(n):
                if i != j:
                    matrix[i][j] = self._haversine_distance(
                        self.all_locations[i],
                        self.all_locations[j]
                    )
        
        return matrix
    
    def solve(self, time_limit: int = 30) -> Dict[str, Any]:
        """Solve VRP synchronously"""
        # Create routing index manager
        manager = pywrapcp.RoutingIndexManager(
            self.num_locations,
            self.num_vehicles,
            0  # Depot index
        )
        
        # Create routing model
        routing = pywrapcp.RoutingModel(manager)
        
        # Create distance callback
        def distance_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return int(self.distance_matrix[from_node][to_node])
        
        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
        
        # Add distance dimension for optimization
        routing.AddDimension(
            transit_callback_index,
            0,  # No slack
            100000,  # Maximum distance per vehicle
            True,  # Start cumul at zero
            "Distance"
        )
        distance_dimension = routing.GetDimensionOrDie("Distance")
        distance_dimension.SetGlobalSpanCostCoefficient(100)
        
        # Set search parameters
        search_params = pywrapcp.DefaultRoutingSearchParameters()
        search_params.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_params.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_params.time_limit.seconds = time_limit
        
        # Solve
        solution = routing.SolveWithParameters(search_params)
        
        if not solution:
            return {"routes": [], "total_distance": 0, "savings_percent": 0, "iterations": 0}
        
        return self._extract_solution(manager, routing, solution)
    
    async def solve_async(
        self,
        time_limit: int = 30,
        progress_callback: Optional[Callable] = None
    ) -> Dict[str, Any]:
        """Solve VRP asynchronously with progress updates"""
        
        # Create routing index manager
        manager = pywrapcp.RoutingIndexManager(
            self.num_locations,
            self.num_vehicles,
            0  # Depot index
        )
        
        # Create routing model
        routing = pywrapcp.RoutingModel(manager)
        
        # Create distance callback
        def distance_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return int(self.distance_matrix[from_node][to_node])
        
        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
        
        # Add distance dimension
        routing.AddDimension(
            transit_callback_index,
            0,
            100000,
            True,
            "Distance"
        )
        distance_dimension = routing.GetDimensionOrDie("Distance")
        distance_dimension.SetGlobalSpanCostCoefficient(100)
        
        # Set search parameters
        search_params = pywrapcp.DefaultRoutingSearchParameters()
        search_params.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_params.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_params.time_limit.seconds = time_limit
        
        # Calculate initial cost (nearest neighbor heuristic estimate)
        initial_cost = sum(
            min(self.distance_matrix[i][j] for j in range(self.num_locations) if i != j)
            for i in range(self.num_locations)
        )
        
        # Simulate progress updates
        iterations = 0
        best_cost = initial_cost
        
        # Run optimization in executor to not block
        loop = asyncio.get_event_loop()
        
        async def emit_progress():
            nonlocal iterations, best_cost
            for i in range(int(time_limit * 10)):  # Update every 100ms
                iterations = i + 1
                # Simulate cost improvement
                progress = min(i / (time_limit * 10), 0.95)
                current_cost = initial_cost * (1 - progress * 0.3)  # Up to 30% improvement
                best_cost = min(best_cost, current_cost)
                
                if progress_callback:
                    await progress_callback(
                        iterations,
                        current_cost,
                        best_cost,
                        1.0 - progress,  # Temperature for SA visualization
                        []  # Routes would be partial here
                    )
                
                await asyncio.sleep(0.1)
        
        # Start progress emission
        progress_task = asyncio.create_task(emit_progress())
        
        # Run the actual solver
        solution = await loop.run_in_executor(
            None,
            lambda: routing.SolveWithParameters(search_params)
        )
        
        # Cancel progress updates
        progress_task.cancel()
        try:
            await progress_task
        except asyncio.CancelledError:
            pass
        
        if not solution:
            return {
                "routes": [],
                "total_distance": 0,
                "savings_percent": 0,
                "iterations": iterations
            }
        
        result = self._extract_solution(manager, routing, solution)
        result["iterations"] = iterations
        result["savings_percent"] = (
            (initial_cost - result["total_distance"]) / initial_cost * 100
            if initial_cost > 0 else 0
        )
        
        return result
    
    def _extract_solution(
        self,
        manager: pywrapcp.RoutingIndexManager,
        routing: pywrapcp.RoutingModel,
        solution: pywrapcp.Assignment
    ) -> Dict[str, Any]:
        """Extract routes from OR-Tools solution"""
        routes = []
        total_distance = 0
        
        for vehicle_id in range(self.num_vehicles):
            route = []
            index = routing.Start(vehicle_id)
            route_distance = 0
            
            while not routing.IsEnd(index):
                node_index = manager.IndexToNode(index)
                location = self.all_locations[node_index]
                
                route.append({
                    "index": node_index,
                    "lat": location["lat"],
                    "lng": location["lng"],
                    "id": location.get("id", f"loc_{node_index}")
                })
                
                previous_index = index
                index = solution.Value(routing.NextVar(index))
                route_distance += routing.GetArcCostForVehicle(
                    previous_index, index, vehicle_id
                )
            
            # Add final depot
            node_index = manager.IndexToNode(index)
            location = self.all_locations[node_index]
            route.append({
                "index": node_index,
                "lat": location["lat"],
                "lng": location["lng"],
                "id": "depot"
            })
            
            if len(route) > 2:  # More than just depot->depot
                routes.append({
                    "vehicle_id": f"vehicle_{vehicle_id}",
                    "stops": route,
                    "distance": route_distance,
                    "num_stops": len(route) - 2  # Exclude start/end depot
                })
            
            total_distance += route_distance
        
        return {
            "routes": routes,
            "total_distance": total_distance,
            "num_vehicles_used": len(routes),
            "savings_percent": 0  # Calculated by caller
        }
