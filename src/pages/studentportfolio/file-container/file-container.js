import React, { useRef, useState, useEffect } from 'react';
import './file-container.css';
import UploadIcon from '../../../assets/images/upload-icon.png';
import UploadDoneIcon from '../../../assets/images/upload-done.png';
import { fileDb } from '../../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import firebase from '../../../firebaseConfig.js';

const FileContainer = ({ highlightedText }) => {
    const fileInputRef = useRef(null);
    const imgRef = useRef(null);
    const containerRef = useRef(null);
    const [fileUpload, setFileUpload] = useState();
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (event) => {
      const selectedFile = event.target.files[0];
        setFileUpload(selectedFile);

        if (selectedFile) {
            const reader = new FileReader();

            reader.onload = (e) => {
                const result = e.target.result;

                if (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('text/')) {
                    const previewElement = document.createElement(
                        selectedFile.type.startsWith('image/') ? 'img' : 'div'
                    );
                    previewElement.src = result;
                    previewElement.style.maxWidth = '100%';
                    containerRef.current.innerHTML = '';
                    containerRef.current.appendChild(previewElement);
                    if(selectedFile.type.startsWith('image/')) {
                      imgRef.current.style.display = 'none';
                    }
                } else if (selectedFile.type === 'application/pdf') {
                    // Display a download link for PDF files
                    imgRef.current.src = UploadDoneIcon;
                    containerRef.current.innerHTML = `
                        <a href="${result}" download="${selectedFile.name}">Download ${selectedFile.name}</a>
                    `;
                } else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    // Display a download link for Word documents
                    imgRef.current.src = UploadDoneIcon;
                    containerRef.current.innerHTML = `
                        <a href="${result}" download="${selectedFile.name}">Download ${selectedFile.name}</a>
                    `;
                } else if (selectedFile.type ===
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') 
                  {
                  // Display a download link for Excel files
                  imgRef.current.src = UploadDoneIcon;
                  containerRef.current.innerHTML = `
                      <a href="${result}" download="${selectedFile.name}">Download ${selectedFile.name}</a>
                  `;
                } else {
                    containerRef.current.innerHTML = `<p>Preview not available for this file type.</p>`;
                }
            };

            reader.readAsDataURL(selectedFile);
        }
    };

    const uploadFile = () => {
        if(!fileUpload) return;

        try{
          const currentUser = firebase.auth().currentUser;
          if (currentUser) {
            const userID = currentUser.uid;
            const fileRef = ref(fileDb, `students_files/${userID}/${fileUpload.name}`);
  
          uploadBytes(fileRef, fileUpload).then((snapshot) => {
              getDownloadURL(snapshot.ref).then((url) => {
                  console.log(url);
                  alert("File successfully uploaded.")
                });
              });
            } 
        } catch (error){
          alert(`Authentication failed: ${error}`);
        }
    }
    
    const openFileFunction = ()=> {
      fileInputRef.current.click();
    }

    //Drag and Drop function
    useEffect(() => {
      const imgElement = imgRef.current;

      const handleDragEnter = (e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
      };

      const handleDragLeave = (e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
      };

      const handleDragOver = (e) => {
          e.preventDefault();
          e.stopPropagation();
      };

      const handleDrop = (e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);

          const files = e.dataTransfer.files;
          if (files.length > 0) {
              setFileUpload(files[0]);
              alert('File selected: ' + files[0].name + '. Click the Upload button to continue.');
          }
      };

        imgElement.addEventListener('dragenter', handleDragEnter);
        imgElement.addEventListener('dragover', handleDragOver);
        imgElement.addEventListener('dragleave', handleDragLeave);
        imgElement.addEventListener('drop', handleDrop);

        return () => {
            imgElement.removeEventListener('dragenter', handleDragEnter);
            imgElement.removeEventListener('dragover', handleDragOver);
            imgElement.removeEventListener('dragleave', handleDragLeave);
            imgElement.removeEventListener('drop', handleDrop);
        };
    }, []);
    


  return (
    <div className={`FC-container ${isDragging ? 'dragging' : ''}`}>
      <img
      ref={imgRef}
      src={UploadIcon}
      className='FC-img'
      width='80px'
      height='80px'
      alt='Upload icon'
      />
      <div ref={containerRef}>
        <p>
          Drag and Drop <span className='text-highlighted'>{ highlightedText }</span> here or
        </p>
      </div>
      <input type='file' className='FC-input-file'onChange={handleFileSelect}
      ref={fileInputRef}
      style={{ display: 'none' }}
      />
      <div className='FC-buttons'>
        <button className='FC-openbtn' onClick={openFileFunction}>Select</button>
        <button className='FC-uploadbtn' onClick={uploadFile}>Upload</button>
      </div>
    </div>
  );
};

export default FileContainer;
