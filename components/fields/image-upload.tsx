'use client'

import { UploadButton } from "@/src/utils/uploadthing";
import { useState } from "react";
import Image from "next/image";

const imageUpload = () => {

    const [imageUrl, setImageUrl] = useState<string>('');

    return (
        <div>
            <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                // Do something with the response
                alert("Upload Completed");
                setImageUrl(res[0].url)
                }}
                onUploadError={(error: Error) => {
                // Do something with the error.
                alert(`ERROR! ${error.message}`);
                }}
            />
            {imageUrl.length ? 
            <div>
                <Image src={imageUrl} alt="my image" width={100} height={100}/>
            </div> : null}
        </div>
    );

};

export default imageUpload;
