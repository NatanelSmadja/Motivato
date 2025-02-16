import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { db } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [inputFocused, setInputFocused] = useState(false);
  const {currentUser } = useAuth()
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (searchTerm === "") {
      setSearchResults([]);
      return;
    }
  
    try {
      const lowerCaseSearchTerm = searchTerm.toLowerCase(); // המרת המונח לאותיות קטנות
  
      const userNameQuery = query(
        collection(db, "Users"),
        where("userNameLower", ">=", lowerCaseSearchTerm),
        where("userNameLower", "<=", lowerCaseSearchTerm + "\uf8ff"),

      );
  
      const firstNameQuery = query(
        collection(db, "Users"),
        where("firstName", ">=", searchTerm),
        where("firstName", "<=", searchTerm + "\uf8ff"),
      );
  
      const lastNameQuery = query(
        collection(db, "Users"),
        where("lastName", ">=", searchTerm),
        where("lastName", "<=", searchTerm + "\uf8ff"),
      );
      const educationQuery = query(
        collection(db, "Users"),
        where("studentEducation", ">=", searchTerm),
        where("studentEducation", "<=", searchTerm + "\uf8ff"),
      );
      const firstNameSnapshot = await getDocs(firstNameQuery);
      const lastNameSnapshot = await getDocs(lastNameQuery);
      const userNameSnapshot = await getDocs(userNameQuery);
      const educationSnapshot = await getDocs(educationQuery);

      const results = [];
      firstNameSnapshot.forEach((doc) => results.push(doc.data()));
      lastNameSnapshot.forEach((doc) => results.push(doc.data()));
      userNameSnapshot.forEach((doc) => results.push(doc.data()));
      educationSnapshot.forEach((doc) => results.push(doc.data()));

      // סינון משתמשים לפי תנאים ספציפיים
      const filteredResults = results.filter(
        (user) => user.userType !== "Admin" && user.uid !== currentUser?.uid && user.isVerified
      );
  
      const uniqueResults = Array.from(
        new Set(filteredResults.map((user) => user.uid))
      ).map((uid) => filteredResults.find((user) => user.uid === uid));
  
      setSearchResults(uniqueResults.slice(0, 7)); // Limit to 7 results
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };
  
  const saveRecentSearch = (user) => {
    setRecentSearches((prev) => {
      const updatedRecents = [
        user,
        ...prev.filter((item) => item.uid !== user.uid),
      ];
      return updatedRecents.slice(0, 5); // Limit to 5 recent searches
    });
  };

  useEffect(() => {
    if (searchTerm) {
      handleSearch();
    }
  }, [searchTerm]);

  const handleUserClick = (uid, user) => {
    saveRecentSearch(user); // Save the recent search
    navigate(`/profile/${uid}`);
    setSearchTerm(""); // Clear the input field
    setInputFocused(false); // Close the search dropdown
  };

  const handleOverlayClick = () => {
    setInputFocused(false); // Close the dropdown when clicking on the overlay
  };

  return (
    <div className="relative max-w-lg">
    {/* Background overlay */}
    {inputFocused && (
      <div
        className="fixed inset-0 bg-black opacity-50 z-40"
        onMouseDown={handleOverlayClick}
      ></div>
    )}
  
    {/* Search input with expanding effect */}
    <div
      className={`relative flex items-center h-10 rounded-full focus-within:shadow-lg bg-[#DAE4F865] overflow-hidden transition-all duration-300 z-50 ${
        inputFocused ? "w-full" : "w-10"
      }`}
    >
      <div
        className="flex items-center justify-center h-full w-10 text-gray-500 cursor-pointer"
        onClick={() => setInputFocused(true)}
      >
        <FaSearch size={18} />
      </div>
      <input
        className={`h-full bg-transparent outline-none text-black pr-4 transition-all duration-300 ${
          inputFocused ? "w-full pl-2" : "w-0"
        }`}
        type="text"
        id="search"
        placeholder={inputFocused ? "חיפוש" : ""}
        value={searchTerm}
        onFocus={() => setInputFocused(true)}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  
    {/* Search results dropdown */}
    {inputFocused && (
      <div
        className="absolute bg-white shadow-lg rounded-lg mt-4 w-[25rem] max-w-2xl max-h-[500px] overflow-y-auto z-50 p-6"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {searchTerm === "" && recentSearches.length > 0 ? (
          <div>
            <p className="text-gray-500 mb-4 text-lg">חיפושים אחרונים</p>
            {recentSearches.map((search, index) => (
              <div
                key={index}
                className="flex items-center p-3 cursor-pointer hover:bg-gray-100"
                onClick={() => handleUserClick(search.uid, search)}
              >
                <FaSearch className="text-gray-400 mr-3" size={18} />
                <p className="text-gray-700 text-lg">{search.userName}</p>
                
                
              </div>
            ))}
          </div>
        ) : (
          <>
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleUserClick(user.uid, user)}
                >
                  <img
                    src={user.profilePicture}
                    alt={user.firstName}
                    className="w-14 h-14 rounded-full mr-4"
                  />
                  <div>
                    <p className="font-medium text-gray-700 text-lg">
                      {user.userName}
                    </p>
                    <p className="font-small text-gray-700 text-m">{user.studentEducation}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 text-lg">
                לא נמצאו משתמשים
              </p>
            )}
          </>
        )}
      </div>
    )}
  </div>
  );
};

export default Search;
