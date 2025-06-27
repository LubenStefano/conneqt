
# **Conneqt**  

🚀 **Live Demo**: [Conneqt - Hosted on GitHub Pages](https://lubenstefano.github.io/conneqt/home)  

## **Table of Contents**  
1. [Introduction](#introduction)
2. [Preview](#preview)
3. [Features](#features)  
4. [Technologies Used](#technologies-used)  
5. [Setup and Installation](#setup-and-installation)  
6. [Usage](#usage)  
7. [Deploy in github pages](#Deploy-in-github-pages)  


---



## **Introduction**  
**Conneqt** is a modern, scalable social networking platform built with Angular and Firebase. Inspired by platforms like Twitter, it allows users to interact with content, save posts, and engage in a connected online environment. Conneqt emphasizes speed, responsiveness, and user-centric design, offering a seamless experience across devices.  

---

## **Preview**  
![image](https://github.com/user-attachments/assets/06c92dc3-1d52-4cf0-b53f-204c99fff524)

![image](https://github.com/user-attachments/assets/8e996941-dfe4-4fb0-b81a-840e26bcf140)

![image](https://github.com/user-attachments/assets/37fef0cb-6627-4aa9-948e-9f47a8e0fc2b)


---

## **Features**  
- **User Authentication**:  
  Powered by Firebase Authentication, enabling secure sign-ups, logins, and profile management.  
- **Post Saving**:  
  Users can save posts to their profiles for quick access.  
- **Real-Time Data**:  
  Firebase's real-time database ensures that users receive live updates across the platform.  
- **Image Cropper**:  
  Integrated image cropping tool for profile picture uploads and more.  
- **Responsive Design**:  
  Optimized for desktop and mobile.  

---

## **Technologies Used**  
- **Frontend**:  
  - Angular (Typescript, HTML, CSS)  
  - RxJS for reactive programming  
- **Backend and Database**:  
  - Firebase Authentication  
  - Firebase Firestore/Cloud storage
- **Hosting**:  
  - GitHub Pages  

---

## **Setup and Installation**  

### **Prerequisites**  
1. Install [Node.js](https://nodejs.org/) (v14+ recommended).  
2. Install [Angular CLI](https://angular.dev/tools/cli):  
   ```bash  
   npm install -g @angular/cli  
   ```  

### **Steps to Clone and Run**  
1. Clone the repository:  
   ```bash  
   git clone https://github.com/LubenStefano/conneqt.git
   ```  

2. Navigate to the project directory:  
   ```bash  
   cd conneqt  
   ```  

3. Install dependencies:  
   ```bash  
   npm install  
   ```  

4. Run the application locally:  
   ```bash  
   ng serve  
   ```  
   The app will be available at `http://localhost:4200`.  


---

## **Usage**  

### **Homepage**  
The homepage features trending posts, the functionality to post and interact with posts.  

### **Profile Management**  
Authenticated users can update their profile picture using the image cropper and customize other personal details.  

### **Saving Posts**  
Click the "Save" button on posts to add them to your saved posts list, accessible via the profile page.  

---

## **Deploy in github pages** 
(Install the package: ```npm install -g angular-cli-ghpages```)
```
ng build --output-path=dist --base-href="/conneqt/"
ngh --dir=dist
ngh --dir=dist/browser

```

---


### **Code Organization**  
- **App Component**:  
  Root-level layout and conditional rendering based on screen size (desktop/mobile).  
- **Services**:  
  Shared logic for API calls, data management, and authentication.  

### **Key Practices**  
- Using Angular CLI for efficient component generation.  
- Employing media queries in CSS for responsive design.  

---
