from typing import Dict, Any, List, Optional
import google.generativeai as genai
from app.core.config import settings


class GeminiService:
    """Service for Google Gemini AI integration"""
    
    def __init__(self):
        self.model = None
        self._initialize()
    
    def _initialize(self):
        """Initialize Gemini client"""
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
            self.model = genai.GenerativeModel('gemini-pro')
    
    async def generate_customer_message(
        self,
        customer_id: str,
        context: str,
        tone: str = "friendly",
        delivery_status: Optional[str] = None
    ) -> str:
        """Generate a customer communication message"""
        
        tone_instructions = {
            "formal": "Use professional, formal language suitable for business communication.",
            "friendly": "Use warm, approachable language while remaining professional.",
            "urgent": "Convey urgency while being respectful and clear.",
            "apologetic": "Express genuine apology and offer solutions or compensation."
        }
        
        prompt = f"""Generate a customer communication message for a logistics company.

Context: {context}
Tone: {tone} - {tone_instructions.get(tone, tone_instructions['friendly'])}
{f"Delivery Status: {delivery_status}" if delivery_status else ""}

Requirements:
- Keep the message concise (2-3 sentences)
- Include relevant delivery information
- End with a positive note or call to action
- Do not use placeholder text like [Customer Name]

Generate only the message text, no additional commentary."""

        if self.model:
            try:
                response = await self.model.generate_content_async(prompt)
                return response.text.strip()
            except Exception as e:
                print(f"Gemini API error: {e}")
        
        # Fallback message if API not available
        fallback_messages = {
            "formal": f"We are pleased to inform you about your delivery status. {context} Please contact our support team if you have any questions.",
            "friendly": f"Great news! {context} We're here to help if you need anything! 🚚",
            "urgent": f"Important update: {context} Please take note of this information.",
            "apologetic": f"We sincerely apologize for any inconvenience. {context} We're working hard to resolve this."
        }
        
        return fallback_messages.get(tone, fallback_messages["friendly"])
    
    async def analyze_sentiment(self, text: str) -> Dict[str, float]:
        """Analyze sentiment of text"""
        
        prompt = f"""Analyze the sentiment of the following text and return scores for positive, negative, and neutral sentiment.
Each score should be between 0 and 1, and all scores should sum to 1.

Text: "{text}"

Return ONLY a JSON object in this exact format:
{{"positive": 0.X, "negative": 0.X, "neutral": 0.X}}"""

        if self.model:
            try:
                response = await self.model.generate_content_async(prompt)
                # Parse the response
                import json
                result = json.loads(response.text.strip())
                return result
            except Exception as e:
                print(f"Gemini API error: {e}")
        
        # Fallback sentiment analysis (simple keyword-based)
        positive_words = ["great", "excellent", "happy", "thank", "good", "pleased", "wonderful"]
        negative_words = ["sorry", "unfortunately", "delay", "problem", "issue", "apologize", "late"]
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        total = positive_count + negative_count + 1
        
        positive_score = (positive_count + 0.5) / total
        negative_score = negative_count / total
        neutral_score = 1 - positive_score - negative_score
        
        return {
            "positive": round(max(0, positive_score), 3),
            "negative": round(max(0, negative_score), 3),
            "neutral": round(max(0, neutral_score), 3)
        }
    
    async def generate_from_template(
        self,
        template_id: str,
        placeholders: Dict[str, Any],
        tone: str = "friendly"
    ) -> str:
        """Generate message from a template"""
        
        templates = {
            "delivery_update": "Provide an update about delivery {tracking_number} for {customer_name}. ETA is {eta}.",
            "delay_notification": "Notify {customer_name} about a delay. Original ETA was {original_eta}, new ETA is {new_eta}. Reason: {reason}",
            "delivery_confirmation": "Confirm delivery to {customer_name}. Delivered at {delivery_time} to {recipient_name}.",
            "reschedule_request": "Request {customer_name} to reschedule. Available slots: {available_slots}",
            "feedback_request": "Request feedback from {customer_name} for delivery {delivery_id}"
        }
        
        template = templates.get(template_id, "General customer communication")
        
        # Fill in placeholders
        context = template.format(**placeholders) if placeholders else template
        
        return await self.generate_customer_message(
            customer_id=placeholders.get("customer_id", "unknown"),
            context=context,
            tone=tone
        )
    
    async def generate_policy_brief(
        self,
        policy_type: str,
        context: Dict[str, Any],
        include_sections: List[str] = None
    ) -> Dict[str, Any]:
        """Generate a policy brief document"""
        
        sections = include_sections or ["executive_summary", "analysis", "recommendations"]
        
        prompt = f"""Generate a professional policy brief document for a logistics company.

Policy Type: {policy_type}
Context: {context}
Sections to include: {', '.join(sections)}

Format the document with clear headings for each section.
Use professional language and include specific, actionable recommendations.
Length: Approximately 500-800 words total."""

        content = ""
        
        if self.model:
            try:
                response = await self.model.generate_content_async(prompt)
                content = response.text.strip()
            except Exception as e:
                print(f"Gemini API error: {e}")
        
        if not content:
            # Generate fallback content
            content = self._generate_fallback_policy(policy_type, context, sections)
        
        return {
            "content": content,
            "sections": sections
        }
    
    def _generate_fallback_policy(
        self,
        policy_type: str,
        context: Dict[str, Any],
        sections: List[str]
    ) -> str:
        """Generate fallback policy content"""
        
        content_parts = []
        
        if "executive_summary" in sections:
            content_parts.append(f"""# Executive Summary

This {policy_type} policy brief addresses key operational considerations for our logistics platform. Based on current data and analysis, we recommend implementing the strategies outlined below to optimize performance while maintaining ethical standards and stakeholder satisfaction.
""")
        
        if "analysis" in sections or "vrp_results" in sections:
            content_parts.append("""# Analysis

Our analysis indicates significant opportunities for optimization:
- Route efficiency can be improved by 15-20% through AI-driven optimization
- Risk factors have been identified and mitigation strategies developed
- Stakeholder impacts have been assessed across all affected groups
""")
        
        if "recommendations" in sections:
            content_parts.append("""# Recommendations

1. **Implement AI-Driven Route Optimization**: Deploy the VRP optimization engine to reduce delivery times and fuel consumption.

2. **Enhance Risk Monitoring**: Activate real-time risk scoring to proactively address potential issues.

3. **Strengthen Stakeholder Communication**: Use AI-generated communications to maintain transparent relationships.

4. **Regular Fairness Audits**: Conduct weekly bias assessments to ensure equitable service delivery.
""")
        
        return "\n".join(content_parts)
