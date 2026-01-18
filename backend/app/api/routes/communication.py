from fastapi import APIRouter, HTTPException
from datetime import datetime

from app.models.schemas import (
    MessageGenerateRequest,
    MessageGenerateResponse,
    SentimentAnalysisRequest,
    SentimentAnalysisResponse
)
from app.services.gemini_service import GeminiService

router = APIRouter()

gemini_service = GeminiService()


@router.post("/communication/generate", response_model=MessageGenerateResponse)
async def generate_message(request: MessageGenerateRequest):
    """Generate a customer message using Gemini AI"""
    try:
        message = await gemini_service.generate_customer_message(
            customer_id=request.customer_id,
            context=request.context,
            tone=request.tone.value,
            delivery_status=request.delivery_status
        )
        
        # Analyze sentiment of generated message
        sentiment = await gemini_service.analyze_sentiment(message)
        
        return MessageGenerateResponse(
            message=message,
            tone=request.tone,
            sentiment=sentiment
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate message: {str(e)}")


@router.post("/communication/sentiment", response_model=SentimentAnalysisResponse)
async def analyze_sentiment(request: SentimentAnalysisRequest):
    """Analyze sentiment of a text"""
    try:
        sentiment = await gemini_service.analyze_sentiment(request.text)
        
        return SentimentAnalysisResponse(
            positive=sentiment.get("positive", 0),
            negative=sentiment.get("negative", 0),
            neutral=sentiment.get("neutral", 0)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")


@router.get("/communication/templates")
async def get_message_templates():
    """Get available message templates"""
    return {
        "templates": [
            {
                "id": "delivery_update",
                "name": "Delivery Update",
                "description": "Inform customer about delivery status",
                "placeholders": ["customer_name", "eta", "tracking_number"]
            },
            {
                "id": "delay_notification",
                "name": "Delay Notification",
                "description": "Apologize for delivery delay",
                "placeholders": ["customer_name", "original_eta", "new_eta", "reason"]
            },
            {
                "id": "delivery_confirmation",
                "name": "Delivery Confirmation",
                "description": "Confirm successful delivery",
                "placeholders": ["customer_name", "delivery_time", "recipient_name"]
            },
            {
                "id": "reschedule_request",
                "name": "Reschedule Request",
                "description": "Request to reschedule delivery",
                "placeholders": ["customer_name", "available_slots"]
            },
            {
                "id": "feedback_request",
                "name": "Feedback Request",
                "description": "Request feedback after delivery",
                "placeholders": ["customer_name", "delivery_id"]
            }
        ]
    }


@router.post("/communication/generate-from-template")
async def generate_from_template(
    template_id: str,
    placeholders: dict,
    tone: str = "friendly"
):
    """Generate message from a template"""
    try:
        message = await gemini_service.generate_from_template(
            template_id=template_id,
            placeholders=placeholders,
            tone=tone
        )
        
        sentiment = await gemini_service.analyze_sentiment(message)
        
        return {
            "message": message,
            "template_id": template_id,
            "tone": tone,
            "sentiment": sentiment,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate from template: {str(e)}")


@router.get("/communication/sentiment-stats")
async def get_sentiment_statistics():
    """Get sentiment statistics for recent communications"""
    # This would normally query the database for historical messages
    return {
        "period": "last_24_hours",
        "total_messages": 150,
        "average_sentiment": {
            "positive": 0.65,
            "negative": 0.15,
            "neutral": 0.20
        },
        "by_tone": {
            "formal": {"count": 45, "avg_positive": 0.55},
            "friendly": {"count": 80, "avg_positive": 0.75},
            "urgent": {"count": 15, "avg_positive": 0.40},
            "apologetic": {"count": 10, "avg_positive": 0.50}
        }
    }
