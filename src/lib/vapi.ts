import Vapi from "@vapi-ai/web";

if (!process.env.NEXT_PUBLIC_VAPI_API_KEY){
  console.error('VAPI_API_KEY is not set in environment variables');
}

if (!process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID){
  console.error('VAPI_ASSISTANT_ID is not set in environment variables');
}

export const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);