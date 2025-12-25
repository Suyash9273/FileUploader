"use client"

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Commet } from 'react-loading-indicators';

function VideoUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();
    //max-file size: 70mb
    const MAX_FILE_SIZE = 70 * 1024 * 1024;//this many bytes

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        if (file.size > MAX_FILE_SIZE) {
            alert("File size limit exceeded");//notification will be here in future
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("originalSize", file.size.toString());

        try {
            const response = await axios.post("/api/video-upload", formData);
            if (response.status >= 200 && response.status < 300) {

            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="heading-2 text-center">Video Upload Section</h1>
            <form className="space-y-4 card" onSubmit={handleSubmit}>
                <div>
                    <label>Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="input-base"
                    />
                </div>

                <div>
                    <label>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input-base"
                    />
                </div>

                <div>
                    <label>Video File</label>
                    <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="input-base"
                    />
                </div>

                {isUploading ? (
                    <Commet color="#0077ff" size="medium" text="" textColor="" />
                ) : (
                    <button
                        type="submit"
                        className="btn btn-primary"
                    >
                        Upload
                    </button>
                )}

            </form>
        </div>
    )
}

export default VideoUpload;