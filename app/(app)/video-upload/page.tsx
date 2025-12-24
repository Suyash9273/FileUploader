import React, {useState} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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
        if(!file) return;
        if(file.size > MAX_FILE_SIZE) {
            alert("File size limit exceeded");//notification will be here in future
            return;
        }
    }

    return (
        <div>

        </div>
    )
}

export default VideoUpload;