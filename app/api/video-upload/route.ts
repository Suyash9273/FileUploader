import {NextResponse, NextRequest} from 'next/server';
import {v2 as cloudinary} from 'cloudinary';
import {auth} from '@clerk/nextjs/server';
import prisma from '@/lib/db';
export const runtime = 'nodejs';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

interface CloudinaryUploadResponse {
    public_id: string;
    bytes: number;
    duration?: number;
    [key: string]: any;// other properties can be included
} 

export async function POST(request: NextRequest) {
    try {
        const {userId} = await auth();
        if(!userId) {
            return NextResponse.json({error: 'Unauthorized'}, {status:401});
        }

        if(!process.env.CLOUDINARY_API_KEY ||
              !process.env.CLOUDINARY_API_SECRET ||
                !process.env.CLOUDINARY_CLOUD_NAME
        ) {
            return NextResponse.json({error: 'Cloudinary credentials are not set'}, {status: 500});
        }

        const formData = await request.formData();
        const file = formData.get('file') as File|null;
        const title = formData.get('title') as string|null;
        const description = formData.get('description') as string|null;
        const originalSize = formData.get('originalSize') as string|null;

        if(!file || !title || !description || !originalSize) { 
            return NextResponse.json({error: 'No file, title, description, or originalSize provided'}, {status:400});
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const result = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
            const upload_stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'video',
                    folder: 'video-uploads',
                    transformation: [
                        { quality: 'auto' },
                        { fetch_format: 'mp4' }
                    ]
                },
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

        const video = await prisma.video.create({
            data:{
            title,
            description,
            publicId: result.public_id,
            originalSize: originalSize,
            compressedSize: String(result.bytes),
            duration: result.duration || 0}
        })

        return NextResponse.json(video, {status: 201});
    } catch (error) {
        console.log("Uploading image failed: ", error);
        return NextResponse.json({error: 'Video upload failed'}, {status: 500});
    } finally {
        await prisma.$disconnect();
    }
}