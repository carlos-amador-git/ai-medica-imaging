import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ detail: "GOOGLE_API_KEY missing" }, { status: 400 });
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ detail: "file is required" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const base64 = buf.toString("base64");

    const genAI = new GoogleGenerativeAI(apiKey);
    //const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `You are a highly skilled medical imaging expert with extensive knowledge in radiology and diagnostic imaging. Analyze the patient's medical image and structure your response as follows, results should be in spanish:

### 1. Imagen tipo y región
- Specify imaging modality (X-ray/MRI/CT/Ultrasound/etc.)
- Identify the patient's anatomical region and positioning
- Comment on image quality and technical adequacy

### 2. Principales hallazgos
- List primary observations systematically
- Note any abnormalities in the patient's imaging with precise descriptions
- Include measurements and densities where relevant
- Describe location, size, shape, and characteristics
- Rate severity: Normal/Mild/Moderate/Severe

### 3. Asesoramiento diagnóstico
- Provide primary diagnosis with confidence level
- List differential diagnoses in order of likelihood
- Support each diagnosis with observed evidence from the patient's imaging
- Note any critical or urgent findings

### 4. Explicación amigable al paciente
- Explain the findings in simple, clear language that the patient can understand
- Avoid medical jargon or provide clear definitions
- Include visual analogies if helpful
- Address common patient concerns related to these findings

### 5. Contexto de investigación
IMPORTANT: Use the DuckDuckGo search tool to:
- Find recent medical literature about similar cases
- Search for standard treatment protocols
- Provide a list of relevant medical links of them too
- Research any relevant technological advances
- Include 2-3 key references to support your analysis

Format your response using clear markdown headers and bullet points. Be concise yet thorough.`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: file.type || "image/png",
          data: base64,
        },
      },
    ]);

    const text = result.response.text();
    return NextResponse.json({ content: text });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message || String(e) }, { status: 500 });
  }
}
