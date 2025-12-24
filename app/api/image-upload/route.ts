import {NextResponse, NextRequest} from 'next/server';
import {v2 as cloudinary} from 'cloudinary';
import {auth} from '@clerk/nextjs/server';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

interface CloudinaryUploadResponse {
    public_id: string;
    [key: string]: any;// other properties can be included
} 

export async function POST(request: NextRequest) {
    try {
        const {userId} = await auth();
        if(!userId) {
            return NextResponse.json({error: 'Unauthorized'}, {status:401});
        }

        const formData = await request.formData();
        const file = formData.get('file') as File|null;
        if(!file) { 
            return NextResponse.json({error: 'No file provided'}, {status:400});
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const result = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
            const upload_stream = cloudinary.uploader.upload_stream(
                {folder: 'image-uploads'},
                (error, result) => {
                    if(error) {
                        reject(error);
                    }
                    else {
                        resolve(result as CloudinaryUploadResponse);
                    }
                }
            )
            upload_stream.end(buffer);
        })

        return NextResponse.json({publicId: result.public_id}, {status: 200});
    } catch (error) {
        console.log("Uploading image failed: ", error);
        return NextResponse.json({error: 'Image upload failed'}, {status: 500});
    }
}