from fastapi import APIRouter, BackgroundTasks, HTTPException
from uuid import uuid4
from datetime import datetime

from app.models.schemas import OptimizationRequest, OptimizationResponse
from app.core.optimization.vrp_solver import VRPSolver
from app.core.socketio import sio

router = APIRouter()

# Store for active optimization runs
active_runs = {}


async def run_optimization_async(run_id: str, request: OptimizationRequest):
    """Background task to run VRP optimization with progress streaming"""
    try:
        # Initialize solver
        solver = VRPSolver(
            locations=request.delivery_locations,
            num_vehicles=request.num_vehicles,
            depot=request.depot_location,
            algorithm=request.algorithm
        )
        
        # Run optimization with progress callback
        async def progress_callback(iteration, current_cost, best_cost, temperature, routes):
            await sio.emit('optimization:progress', {
                'runId': run_id,
                'iteration': iteration,
                'currentCost': current_cost,
                'bestCost': best_cost,
                'temperature': temperature,
                'currentRoutes': routes,
                'algorithm': request.algorithm
            })
        
        # Execute optimization with algorithm-specific params
        result = await solver.solve_async(
            time_limit=request.time_limit_seconds,
            progress_callback=progress_callback,
            population_size=request.population_size,
            mutation_rate=request.mutation_rate,
            initial_temp=request.initial_temp,
            cooling_rate=request.cooling_rate
        )
        
        # Store result
        active_runs[run_id]['status'] = 'completed'
        active_runs[run_id]['routes'] = result['routes']
        active_runs[run_id]['completed_at'] = datetime.utcnow().isoformat()
        
        # Emit completion event
        await sio.emit('optimization:complete', {
            'runId': run_id,
            'routes': result['routes'],
            'savingsPercent': result.get('savings_percent', 0),
            'totalIterations': result.get('iterations', 0),
            'algorithm': request.algorithm
        })
        
    except Exception as e:
        active_runs[run_id]['status'] = 'failed'
        active_runs[run_id]['error'] = str(e)
        
        await sio.emit('optimization:error', {
            'runId': run_id,
            'error': str(e)
        })


@router.post("/optimization/start", response_model=OptimizationResponse)
async def start_optimization(
    request: OptimizationRequest,
    background_tasks: BackgroundTasks
):
    """Start a new VRP optimization run"""
    run_id = str(uuid4())
    
    # Initialize run tracking
    active_runs[run_id] = {
        'status': 'running',
        'algorithm': request.algorithm,
        'num_vehicles': request.num_vehicles,
        'num_deliveries': len(request.delivery_locations),
        'started_at': datetime.utcnow().isoformat(),
        'routes': []
    }
    
    # Start background optimization
    background_tasks.add_task(run_optimization_async, run_id, request)
    
    return OptimizationResponse(
        run_id=run_id,
        status='started',
        routes=[]
    )


@router.get("/optimization/{run_id}/status")
async def get_optimization_status(run_id: str):
    """Get current status of an optimization run"""
    if run_id not in active_runs:
        raise HTTPException(status_code=404, detail="Optimization run not found")
    
    return active_runs[run_id]


@router.post("/optimization/{run_id}/cancel")
async def cancel_optimization(run_id: str):
    """Cancel an active optimization run"""
    if run_id not in active_runs:
        raise HTTPException(status_code=404, detail="Optimization run not found")
    
    if active_runs[run_id]['status'] == 'running':
        active_runs[run_id]['status'] = 'cancelled'
        
        await sio.emit('optimization:cancelled', {'runId': run_id})
        
        return {"message": "Optimization cancelled", "run_id": run_id}
    
    return {"message": "Optimization already completed or failed", "status": active_runs[run_id]['status']}


@router.get("/optimization/history")
async def get_optimization_history():
    """Get history of all optimization runs"""
    return list(active_runs.values())
