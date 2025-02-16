import React, { useState } from "react";
import "./MyPost.css";
import ModalPost from "../Modal/ModalPost/ModalPost";
import { useAuth } from "../../context/AuthContext";
import { getCurrentTimeStamp } from "../../features/useMoment/useMoment";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../config/firebase";
import { createPost } from "../../hooks/useLoadPosts";

const MyPost = () => {
  const { currentUser } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [post, setPost] = useState("");
  const [postImage, setPostImage] = useState(null);

  const sendPost = async () => {
    let imageURL = "";
    if (postImage) {
      try {
        imageURL = await uploadPostImage(postImage);
      } catch (error) {
        console.error("Error uploading image: ", error);
        return;
      }
    }
    
    let object = {
      user: {
        uid: currentUser?.uid || "No UID",
        username: currentUser?.userName || "Anonymouns",
      },
      post: post,
      timeStamp: getCurrentTimeStamp("LLL"),
      postImage: imageURL,
    };

    try {
      await createPost(object)
      setModalOpen(false);
      setPost("");
      setPostImage(null);
    } catch (error) {
      console.error("Error posting status: ", error);
    }
  };

  const uploadPostImage = async (file) => {
    const storageRef = ref(
      storage,
      `ImagePost/${currentUser.uid}/${file.name}`
    ); // file path
    await uploadBytes(storageRef, file); // uploading file
    const url = await getDownloadURL(storageRef); // URL
    return url; // return url image
  };
  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-6 min-w-[25rem] md:min-w-5xl  max-w-[25rem] md:max-w-5xl mx-auto mt-5">
      <div className="flex items-center space-x-4">
        <img
          src={currentUser.profilePicture || "defaultProfilePictureURL"}
          alt="Profile"
          className="w-12 h-12 rounded-full object-contain ml-3"
        />
        <button
          className="flex-grow bg-gray-50 hover:bg-gray-100 transition duration-100 text-gray-800 py-4 px-4 rounded-lg text-right"
          onClick={() => setModalOpen(true)}
        >
          כתיבת פוסט חדש
        </button>
      </div>
      <ModalPost
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        setPost={setPost}
        post={post}
        sendPost={sendPost}
        postImage={postImage}
        setPostImage={setPostImage}
      />
    </div>
  );
};

export default MyPost;
