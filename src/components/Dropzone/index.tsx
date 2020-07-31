import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import { FiUpload } from 'react-icons/fi';

import './styles.css';

interface DropzoneProps {
  fileUpload(file: File): void;
}

const Dropzone: React.FC<DropzoneProps> = ({ fileUpload }) => {
  const [ selectedFileUrl, setSelectedFileUrl ]= useState('')

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];

    const fileUrl = URL.createObjectURL(file);

    setSelectedFileUrl(fileUrl);
    fileUpload(file);
  }, [fileUpload])

  const {getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*'
  })

  return (
    <div className='dropzone' {...getRootProps()}>
      <input {...getInputProps()} accept='image/*' />

      {selectedFileUrl
        ? <img src={selectedFileUrl} alt='Point' />
        : (
          <p>
            <FiUpload/>
            Imagem do Estabelecimento
          </p>
        )
      }
    </div>
  )
}

export default Dropzone;