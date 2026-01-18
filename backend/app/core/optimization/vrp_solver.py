from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import numpy as np
from typing import List, Dict, Any, Callable, Optional
import asyncio
import random
from math import radians, sin, cos, sqrt, atan2, exp


class VRPSolver:
    """Vehicle Routing Problem Solver with multiple algorithm support"""
    
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
        
        # Calculate baseline cost (naive nearest neighbor)
        self.baseline_cost = self._calculate_baseline_cost()
    
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
    
    def _calculate_baseline_cost(self) -> float:
        """Calculate baseline cost using naive approach (all vehicles go to all points from depot)"""
        # Simple baseline: sum of round-trip distances from depot to each location
        total = 0
        for i in range(1, self.num_locations):
            total += 2 * self.distance_matrix[0][i]  # Round trip to depot
        return total
    
    def _create_initial_solution(self) -> List[List[int]]:
        """Create initial solution by distributing locations among vehicles"""
        locations_per_vehicle = (self.num_locations - 1) // self.num_vehicles
        routes = []
        loc_idx = 1  # Skip depot
        
        for v in range(self.num_vehicles):
            route = [0]  # Start at depot
            count = locations_per_vehicle
            if v == self.num_vehicles - 1:
                count = self.num_locations - 1 - loc_idx + 1
            
            for _ in range(count):
                if loc_idx < self.num_locations:
                    route.append(loc_idx)
                    loc_idx += 1
            
            route.append(0)  # Return to depot
            routes.append(route)
        
        return routes
    
    def _calculate_route_cost(self, routes: List[List[int]]) -> float:
        """Calculate total cost of all routes"""
        total = 0
        for route in routes:
            for i in range(len(route) - 1):
                total += self.distance_matrix[route[i]][route[i + 1]]
        return total
    
    def _routes_to_output(self, routes: List[List[int]], total_distance: float) -> Dict[str, Any]:
        """Convert routes to output format"""
        output_routes = []
        
        for v_idx, route in enumerate(routes):
            if len(route) <= 2:  # Just depot-depot
                continue
            
            stops = []
            route_distance = 0
            
            for i, loc_idx in enumerate(route):
                location = self.all_locations[loc_idx]
                stops.append({
                    "index": loc_idx,
                    "lat": location["lat"],
                    "lng": location["lng"],
                    "id": location.get("id", f"loc_{loc_idx}") if loc_idx > 0 else "depot"
                })
                
                if i > 0:
                    route_distance += self.distance_matrix[route[i-1]][route[i]]
            
            output_routes.append({
                "vehicle_id": f"vehicle_{v_idx}",
                "stops": stops,
                "distance": route_distance,
                "num_stops": len(route) - 2,
                "color": self._get_vehicle_color(v_idx)
            })
        
        savings = ((self.baseline_cost - total_distance) / self.baseline_cost * 100) if self.baseline_cost > 0 else 0
        
        return {
            "routes": output_routes,
            "total_distance": total_distance,
            "num_vehicles_used": len(output_routes),
            "savings_percent": max(0, savings),  # Ensure non-negative
            "baseline_cost": self.baseline_cost
        }
    
    def _get_vehicle_color(self, idx: int) -> str:
        """Get color for vehicle route visualization"""
        colors = [
            "#00f5ff",  # Cyan
            "#39ff14",  # Green
            "#ff6b6b",  # Red
            "#ffd93d",  # Yellow
            "#a855f7",  # Purple
            "#ff8c00",  # Orange
            "#00bfff",  # Deep Sky Blue
            "#ff1493",  # Deep Pink
        ]
        return colors[idx % len(colors)]

    # ========== OR-Tools Solver ==========
    
    def solve_ortools(self, time_limit: int = 30) -> Dict[str, Any]:
        """Solve VRP using Google OR-Tools"""
        manager = pywrapcp.RoutingIndexManager(
            self.num_locations,
            self.num_vehicles,
            0
        )
        
        routing = pywrapcp.RoutingModel(manager)
        
        def distance_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return int(self.distance_matrix[from_node][to_node])
        
        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
        
        routing.AddDimension(
            transit_callback_index,
            0,
            100000,
            True,
            "Distance"
        )
        distance_dimension = routing.GetDimensionOrDie("Distance")
        distance_dimension.SetGlobalSpanCostCoefficient(100)
        
        search_params = pywrapcp.DefaultRoutingSearchParameters()
        search_params.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_params.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_params.time_limit.seconds = time_limit
        
        solution = routing.SolveWithParameters(search_params)
        
        if not solution:
            return {"routes": [], "total_distance": 0, "savings_percent": 0, "iterations": 0}
        
        return self._extract_ortools_solution(manager, routing, solution)
    
    def _extract_ortools_solution(self, manager, routing, solution) -> Dict[str, Any]:
        """Extract routes from OR-Tools solution"""
        routes = []
        total_distance = 0
        
        for vehicle_id in range(self.num_vehicles):
            route = []
            index = routing.Start(vehicle_id)
            route_distance = 0
            
            while not routing.IsEnd(index):
                node_index = manager.IndexToNode(index)
                route.append(node_index)
                previous_index = index
                index = solution.Value(routing.NextVar(index))
                route_distance += routing.GetArcCostForVehicle(previous_index, index, vehicle_id)
            
            route.append(0)  # Return to depot
            
            if len(route) > 2:
                routes.append(route)
            
            total_distance += route_distance
        
        return self._routes_to_output(routes, total_distance)

    # ========== Genetic Algorithm ==========
    
    def _crossover(self, parent1: List[int], parent2: List[int]) -> List[int]:
        """Order crossover for TSP-like problems"""
        size = len(parent1)
        if size <= 2:
            return parent1[:]
        
        start, end = sorted(random.sample(range(1, size - 1), 2))
        child = [-1] * size
        child[0] = 0
        child[-1] = 0
        
        # Copy segment from parent1
        child[start:end] = parent1[start:end]
        
        # Fill remaining from parent2
        p2_idx = 1
        for i in range(1, size - 1):
            if child[i] == -1:
                while parent2[p2_idx] in child:
                    p2_idx += 1
                    if p2_idx >= size - 1:
                        p2_idx = 1
                child[i] = parent2[p2_idx]
                p2_idx += 1
        
        return child
    
    def _mutate(self, route: List[int], mutation_rate: float = 0.1) -> List[int]:
        """Swap mutation"""
        if len(route) <= 3 or random.random() > mutation_rate:
            return route
        
        route = route[:]
        i, j = random.sample(range(1, len(route) - 1), 2)
        route[i], route[j] = route[j], route[i]
        return route
    
    async def solve_genetic_async(
        self,
        time_limit: int = 30,
        progress_callback: Optional[Callable] = None,
        population_size: int = 50,
        mutation_rate: float = 0.1
    ) -> Dict[str, Any]:
        """Solve VRP using Genetic Algorithm"""
        
        # Create initial population - each individual is a permutation of locations
        all_locs = list(range(1, self.num_locations))
        population = []
        
        for _ in range(population_size):
            perm = all_locs[:]
            random.shuffle(perm)
            # Create route: depot -> locations -> depot
            individual = [0] + perm + [0]
            population.append(individual)
        
        def fitness(individual: List[int]) -> float:
            """Lower cost = higher fitness"""
            cost = 0
            for i in range(len(individual) - 1):
                cost += self.distance_matrix[individual[i]][individual[i + 1]]
            return cost
        
        best_individual = min(population, key=fitness)
        best_cost = fitness(best_individual)
        initial_cost = best_cost
        
        iterations = 0
        max_iterations = time_limit * 20  # ~20 iterations per second
        
        for gen in range(max_iterations):
            iterations = gen + 1
            
            # Evaluate fitness
            costs = [(ind, fitness(ind)) for ind in population]
            costs.sort(key=lambda x: x[1])
            
            current_cost = costs[0][1]
            if current_cost < best_cost:
                best_cost = current_cost
                best_individual = costs[0][0][:]
            
            # Selection - keep top 50%
            survivors = [ind for ind, _ in costs[:population_size // 2]]
            
            # Crossover to create new population
            new_population = survivors[:]
            while len(new_population) < population_size:
                p1, p2 = random.sample(survivors, 2)
                child = self._crossover(p1, p2)
                child = self._mutate(child, mutation_rate)
                new_population.append(child)
            
            population = new_population
            
            # Progress callback
            if progress_callback and gen % 5 == 0:
                # Calculate diversity (variance in costs)
                diversity = np.std([c for _, c in costs]) / np.mean([c for _, c in costs]) if costs else 0
                
                await progress_callback(
                    iterations,
                    current_cost,
                    best_cost,
                    diversity,  # Use diversity as "temperature" equivalent
                    []
                )
            
            await asyncio.sleep(0.05)  # Allow other tasks
        
        # Convert best individual to routes format
        routes = [[0] + best_individual[1:-1] + [0]]  # Single route for simplicity
        
        # Split into multiple vehicle routes
        locs_per_vehicle = max(1, (self.num_locations - 1) // self.num_vehicles)
        split_routes = []
        loc_list = best_individual[1:-1]
        
        for v in range(self.num_vehicles):
            start_idx = v * locs_per_vehicle
            end_idx = start_idx + locs_per_vehicle if v < self.num_vehicles - 1 else len(loc_list)
            if start_idx < len(loc_list):
                route = [0] + loc_list[start_idx:end_idx] + [0]
                split_routes.append(route)
        
        result = self._routes_to_output(split_routes, best_cost)
        result["iterations"] = iterations
        result["algorithm"] = "genetic"
        
        return result

    # ========== Simulated Annealing ==========
    
    async def solve_simulated_annealing_async(
        self,
        time_limit: int = 30,
        progress_callback: Optional[Callable] = None,
        initial_temp: float = 10000.0,
        cooling_rate: float = 0.995,
        min_temp: float = 1.0
    ) -> Dict[str, Any]:
        """Solve VRP using Simulated Annealing"""
        
        # Create initial solution
        all_locs = list(range(1, self.num_locations))
        random.shuffle(all_locs)
        current_solution = [0] + all_locs + [0]
        
        def cost(solution: List[int]) -> float:
            total = 0
            for i in range(len(solution) - 1):
                total += self.distance_matrix[solution[i]][solution[i + 1]]
            return total
        
        current_cost = cost(current_solution)
        best_solution = current_solution[:]
        best_cost = current_cost
        initial_cost = current_cost
        
        temperature = initial_temp
        iterations = 0
        max_iterations = time_limit * 50
        
        for i in range(max_iterations):
            iterations = i + 1
            
            # Generate neighbor by swapping two random locations
            if len(current_solution) > 3:
                neighbor = current_solution[:]
                idx1, idx2 = random.sample(range(1, len(neighbor) - 1), 2)
                neighbor[idx1], neighbor[idx2] = neighbor[idx2], neighbor[idx1]
                
                neighbor_cost = cost(neighbor)
                delta = neighbor_cost - current_cost
                
                # Accept if better or with probability based on temperature
                if delta < 0 or random.random() < exp(-delta / temperature):
                    current_solution = neighbor
                    current_cost = neighbor_cost
                    
                    if current_cost < best_cost:
                        best_cost = current_cost
                        best_solution = current_solution[:]
            
            # Cool down
            temperature = max(min_temp, temperature * cooling_rate)
            
            # Normalized temperature for visualization (0-1)
            temp_normalized = (temperature - min_temp) / (initial_temp - min_temp)
            
            # Progress callback
            if progress_callback and i % 10 == 0:
                await progress_callback(
                    iterations,
                    current_cost,
                    best_cost,
                    temp_normalized,
                    []
                )
            
            await asyncio.sleep(0.02)
            
            if temperature <= min_temp:
                break
        
        # Split into multiple vehicle routes
        locs_per_vehicle = max(1, (self.num_locations - 1) // self.num_vehicles)
        split_routes = []
        loc_list = best_solution[1:-1]
        
        for v in range(self.num_vehicles):
            start_idx = v * locs_per_vehicle
            end_idx = start_idx + locs_per_vehicle if v < self.num_vehicles - 1 else len(loc_list)
            if start_idx < len(loc_list):
                route = [0] + loc_list[start_idx:end_idx] + [0]
                split_routes.append(route)
        
        result = self._routes_to_output(split_routes, best_cost)
        result["iterations"] = iterations
        result["algorithm"] = "simulated_annealing"
        result["final_temperature"] = temperature
        
        return result

    # ========== Async Wrapper ==========
    
    async def solve_async(
        self,
        time_limit: int = 30,
        progress_callback: Optional[Callable] = None,
        population_size: int = 50,
        mutation_rate: float = 0.1,
        initial_temp: float = 10000.0,
        cooling_rate: float = 0.995
    ) -> Dict[str, Any]:
        """Solve VRP asynchronously with the selected algorithm"""
        
        if self.algorithm == "genetic":
            return await self.solve_genetic_async(
                time_limit=time_limit,
                progress_callback=progress_callback,
                population_size=population_size,
                mutation_rate=mutation_rate
            )
        elif self.algorithm == "simulated_annealing":
            return await self.solve_simulated_annealing_async(
                time_limit=time_limit,
                progress_callback=progress_callback,
                initial_temp=initial_temp,
                cooling_rate=cooling_rate
            )
        else:
            # OR-Tools with simulated progress
            return await self._solve_ortools_async(
                time_limit=time_limit,
                progress_callback=progress_callback
            )
    
    async def _solve_ortools_async(
        self,
        time_limit: int = 30,
        progress_callback: Optional[Callable] = None
    ) -> Dict[str, Any]:
        """Run OR-Tools solver with progress simulation"""
        
        loop = asyncio.get_event_loop()
        
        # Calculate initial cost estimate
        initial_routes = self._create_initial_solution()
        initial_cost = self._calculate_route_cost(initial_routes)
        best_cost = initial_cost
        
        iterations = 0
        
        async def emit_progress():
            nonlocal iterations, best_cost
            for i in range(int(time_limit * 10)):
                iterations = i + 1
                progress = min(i / (time_limit * 10), 0.95)
                
                # Simulate realistic optimization: current cost fluctuates, best cost only decreases
                improvement = progress * 0.35  # Up to 35% improvement
                noise = random.uniform(-0.05, 0.05)  # Random fluctuation
                
                current_cost = initial_cost * (1 - improvement + noise)
                current_cost = max(current_cost, initial_cost * 0.6)  # Don't go below 60%
                
                if current_cost < best_cost:
                    best_cost = current_cost
                
                if progress_callback:
                    await progress_callback(
                        iterations,
                        current_cost,
                        best_cost,
                        1.0 - progress,
                        []
                    )
                
                await asyncio.sleep(0.1)
        
        progress_task = asyncio.create_task(emit_progress())
        
        # Run actual solver
        solution = await loop.run_in_executor(
            None,
            lambda: self.solve_ortools(time_limit)
        )
        
        progress_task.cancel()
        try:
            await progress_task
        except asyncio.CancelledError:
            pass
        
        solution["iterations"] = iterations
        solution["algorithm"] = "ortools"
        
        return solution
    
    def solve(self, time_limit: int = 30) -> Dict[str, Any]:
        """Synchronous solve - uses OR-Tools"""
        return self.solve_ortools(time_limit)
