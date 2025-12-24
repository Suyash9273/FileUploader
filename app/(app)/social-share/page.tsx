"use client"

import React, { useState, useEffect, useRef } from 'react'
import { CldImage } from 'next-cloudinary';
import { Commet } from 'react-loading-indicators';

const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "Instagram Portrait (4:5)": { width: 1080, height: 1350, aspectRatio: "4:5" },
  "Twitter Post (16:9)": { width: 1200, height: 675, aspectRatio: "16:9" },
  "Twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "Facebook Cover (205:78)": { width: 820, height: 312, aspectRatio: "205:78" },
};

type SocialFormat = keyof typeof socialFormats

export default function SocialShare() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<SocialFormat>("Instagram Square (1:1)");

  const [isUploading, setIsUploading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if(uploadedImage) {
      setIsTransforming(true);
    }
  }, [selectedFormat, uploadedImage])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/image-upload', {
        method: 'POST',
        body: formData
      });

      if(!response.ok) {
        throw new Error('Image upload failed');
      }

      const data = await response.json();
      setUploadedImage(data.publicId);
    } catch (error) {
      console.log(error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }

  const handleDownload = () => {
    if(!imageRef.current) return;

    fetch(imageRef.current.src)
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    })
  }

  return (
    <div className='container mx-auto p-4 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-6 text-center'>Social-Media Image Creator</h1>

      <div className='card'>
        <div className='card-body'>
          <h2 className='mb-4 text-emerald-300 text-xl font-semibold card-header text-center'>Upload an Image</h2>
          <div className='form-control'>
              <label htmlFor='file-upload'>
                <span className='btn btn-primary'>Choose an image file</span>
              </label>
              <input id='file-upload' className='hidden' type="file" onChange={handleFileUpload}/>
          </div>
          {
            isUploading && (
              <Commet color="#0077ff" size="medium" text="" textColor="" />
            )
          }

          {
            uploadedImage && (
              <div className='mt-6'>
                <h2>Select Social Media Format</h2>
                <div className='form-control'>
                  <select 
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as SocialFormat)}
                  >
                    {
                      Object.keys(socialFormats).map((format) => (
                        <option key={format} value={format}>{format}</option>
                      ))
                    }
                  </select>
                </div>

                <div className='mt-6 relative'>
                  <h3 className='text-lg font-semibold mb-2'>Preview:</h3>
                  <div className='flex justify-center'>
                    {
                      isTransforming && (
                        <div className="absolute inset-0 bg-black bg-opacity-50">
                          <Commet color="#0077ff" size="medium" text="" textColor="" />
                        </div>
                      )
                    }
                    <CldImage
                    width={socialFormats[selectedFormat].width}
                    height={socialFormats[selectedFormat].height}
                    src={uploadedImage}
                    sizes="100vw"
                    alt='transformed-image'
                    crop={`fill`}
                    aspectRatio={socialFormats[selectedFormat].aspectRatio}
                    gravity='auto'
                    ref={imageRef}
                    onLoad={() => setIsTransforming(false)}
                    />
                  </div>
                </div>

                <div className='justify-end mt-6'>
                  <button className='btn btn-secondary' onClick={handleDownload}>
                    Download for {selectedFormat}
                  </button>
                </div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}