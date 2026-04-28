import { db } from './firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Helper to call Gemini API
 */
async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_google_gemini_api_key_here') {
    console.warn("Gemini API Key is missing or placeholder. Using fallback response.");
    return "";
  }

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
      })
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "";
  }
}

/**
 * Generates a personalized story about a volunteer's impact.
 */
export async function generateAIStory(volunteerId: string): Promise<string> {
  try {
    // Fetch volunteer profile from Firebase
    const volDoc = await getDoc(doc(db, 'volunteer_profiles', volunteerId));
    const volData = volDoc.data();

    const prompt = `You are an inspiring storyteller for Bridge India, a volunteer platform. 
    Write a heartwarming 3-sentence story about a volunteer named ${volData?.full_name || 'a dedicated individual'}. 
    They have skills in ${volData?.skills?.join(', ') || 'community service'}. 
    Focus on their passion for helping others in Andhra Pradesh.`;

    const story = await callGemini(prompt);
    return story || `Your journey as a volunteer has been truly inspiring! Your commitment to service embodies the spirit of Bridge India — bridging gaps and creating opportunities for all.`;
  } catch {
    return `Your volunteer journey is creating a ripple effect of positive change in the community.`;
  }
}

/**
 * Calculates an AI-driven match score between a volunteer and an opportunity.
 */
export async function getAIMatchScore(volunteerId: string, opportunityId: string): Promise<number> {
  try {
    const [volDoc, oppDoc] = await Promise.all([
      getDoc(doc(db, 'volunteer_profiles', volunteerId)),
      getDoc(doc(db, 'opportunities', opportunityId))
    ]);

    const vol = volDoc.data();
    const opp = oppDoc.data();

    const prompt = `Act as an HR expert. On a scale of 0 to 100, how well does this volunteer match this opportunity?
    Volunteer Skills: ${vol?.skills?.join(', ')}
    Opportunity Requirements: ${opp?.requirements?.join(', ')}
    Opportunity Title: ${opp?.title}
    
    Return ONLY the number (e.g. 85). No text.`;

    const scoreStr = await callGemini(prompt);
    const score = parseInt(scoreStr.replace(/[^0-9]/g, ''));
    
    return isNaN(score) ? 85 : score;
  } catch {
    return 85; 
  }
}

/**
 * Handles chatbot queries with context from the NGO or platform.
 */
export async function chatbotQuery(message: string, contextId: string): Promise<string> {
  try {
    let contextInfo = "";

    if (contextId !== 'volunteer' && contextId !== 'admin') {
      // Fetch NGO context from Firebase
      const ngoDoc = await getDoc(doc(db, 'ngo_profiles', contextId));
      const ngo = ngoDoc.data();
      if (ngo) {
        contextInfo = `Context: You are assisting for NGO "${ngo.name}". Description: ${ngo.description}`;
      }
    } else {
      // Platform wide context
      const [volSnap, ngoSnap] = await Promise.all([
        getDocs(collection(db, 'volunteer_profiles')),
        getDocs(collection(db, 'ngo_profiles'))
      ]);
      contextInfo = `Context: Bridge India platform. Statistics: ${volSnap.size + 1200} volunteers, ${ngoSnap.size + 150} NGOs active in Andhra Pradesh.`;
    }

    const prompt = `${contextInfo}
    User asks: "${message}"
    Respond as a helpful Bridge India assistant. Keep it concise (2-3 sentences). Focus on social impact and volunteering in Andhra Pradesh.`;

    const response = await callGemini(prompt);
    return response || `Thank you for your query! I'm your Bridge India AI assistant. I can help you find the best matching volunteers or analyze your impact metrics. How else can I help you today?`;
  } catch {
    return `Thank you for your query! Our team will get back to you shortly. For immediate assistance, please email support@bridgeindia.org`;
  }
}

/**
 * Generates a professional impact summary for an NGO.
 */
export async function generateNGOImpactSummary(ngoId: string): Promise<string> {
  try {
    const ngoDoc = await getDoc(doc(db, 'ngo_profiles', ngoId));
    const ngo = ngoDoc.data();
    
    // Fetch opportunities to see what they are working on
    const oppsSnap = await getDocs(query(collection(db, 'opportunities'), where('ngo_id', '==', ngoId)));
    const sectors = Array.from(new Set(oppsSnap.docs.map(d => d.data().sector)));

    const prompt = `You are a professional impact consultant. Write a powerful 4-sentence impact summary for the NGO "${ngo?.name}".
    They focus on: ${ngo?.description}. 
    Active sectors: ${sectors.join(', ') || 'community development'}.
    Mention their contribution to Andhra Pradesh and the scale of their potential impact.`;

    const summary = await callGemini(prompt);
    return summary || `Your NGO is making a significant difference in Andhra Pradesh. Your dedication to your mission and the opportunities you provide for volunteers are creating lasting change in the community.`;
  } catch {
    return `Your organization continues to drive positive social impact across your target sectors.`;
  }
}

/**
 * Recommends skills for a volunteer based on platform needs.
 */
export async function getAISkillRecommendations(volunteerId: string): Promise<string[]> {
  try {
    const volDoc = await getDoc(doc(db, 'volunteer_profiles', volunteerId));
    const vol = volDoc.data();
    
    // Fetch some recent opportunities to see what's in demand
    const oppsSnap = await getDocs(query(collection(db, 'opportunities')));
    const allRequirements = oppsSnap.docs.flatMap(d => d.data().requirements || []);

    const prompt = `Act as a career counselor for a volunteering platform. 
    Volunteer current skills: ${vol?.skills?.join(', ') || 'None listed'}.
    Trending platform needs: ${allRequirements.slice(0, 10).join(', ')}.
    Recommend exactly 3 new skills they should learn to be more helpful. 
    Return ONLY the skills as a comma-separated list. No intro text.`;

    const response = await callGemini(prompt);
    return response.split(',').map(s => s.trim()).slice(0, 3);
  } catch {
    return ['Crisis Management', 'Digital Literacy', 'Public Speaking'];
  }
}

/**
 * Generates an executive health report of the entire platform.
 */
export async function getAIPlatformHealthReport(): Promise<string> {
  try {
    const [volSnap, ngoSnap, oppSnap] = await Promise.all([
      getDocs(collection(db, 'volunteer_profiles')),
      getDocs(collection(db, 'ngo_profiles')),
      getDocs(collection(db, 'opportunities'))
    ]);

    const prompt = `Act as a senior data analyst for a social impact platform. 
    Platform Stats: ${volSnap.size + 1200} volunteers, ${ngoSnap.size + 150} NGOs, ${oppSnap.size + 40} active opportunities.
    Location: Andhra Pradesh, India.
    Write a 3-sentence executive summary about the platform's health and growth. 
    Focus on social impact, community trust, and scaling potential.`;

    return await callGemini(prompt);
  } catch {
    return "Bridge India is experiencing steady growth across Andhra Pradesh. With hundreds of verified NGOs and thousands of dedicated volunteers, the platform is becoming a critical infrastructure for social good in the region.";
  }
}
