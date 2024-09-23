import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { FiUpload } from 'react-icons/fi';
import { getCroppedImg } from './utils/index';
import './App.css';

const ImageCropUpload: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedImage, setCroppedImage] = useState<any | null>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = async () => {
    if (!imageSrc || !croppedArea) return;

    try {
      const croppedImageData = await getCroppedImg(imageSrc, croppedArea);
      setCroppedImage(croppedImageData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = () => {
    if (!croppedImage) return;

    const formData = new FormData();
    formData.append('file', croppedImage, 'cropped-image.jpg');

    fetch('/upload', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error(error));
  };

  return (
    <div className="image-cropper">
      <div>
        <label htmlFor="fileInput" className="upload-button">
          <FiUpload size={24} />
          Select Image
        </label>
        <input
          type="file"
          id="fileInput"
          style={{ display: 'none' }}
          accept="image/*"
          onChange={onSelectFile}
        />
      </div>

      {imageSrc && (
        <>
          <div className="crop-container">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div>
            <button onClick={handleCrop}>Crop</button>
            {croppedImage && <img src={croppedImage} alt="Cropped" />}
            <button onClick={handleUpload}>Upload</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCropUpload;
