import React from "react";
import { Github, ExternalLink, Mail, Linkedin } from "lucide-react";

export default function PortfolioClone() {

  return (
    <main className="relative min-h-screen bg-black text-white overflow-x-hidden font-sans">
      <section className="relative w-full h-screen overflow-hidden flex items-center justify-center px-6">
        <div className="flex items-center max-w-7xl w-full z-10">
          {/* Left Side Social Icons */}
          <div className="flex flex-col items-center mr-8 z-10">
            <div className="w-4 h-4 bg-white rounded-full mb-2"></div>
            <div className="w-px h-16 bg-gradient-to-b from-white to-transparent"></div>
            <div className="flex flex-col items-center gap-4 mt-4">
              <a
                href="https://github.com/leonRandip"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-5 h-5 hover:scale-125 transition-transform" />
              </a>
              <a
                href="https://www.linkedin.com/in/leonrandip/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="w-5 h-5 hover:scale-125 transition-transform" />
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=leonrandip@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Mail className="w-5 h-5 hover:scale-125 transition-transform" />
              </a>
            </div>
            <div className="w-px h-40 bg-gradient-to-b from-white to-black mt-4"></div>
          </div>
          {/* Right Side Text */}
          <div className="flex flex-col z-10">
            <h1 className="text-5xl font-bold mb-4">
              Hello, I'm Maria Randip Leon
            </h1>
            <h2 className="text-3xl font-semibold text-gray-300 mb-6">
              Full-Stack Web Developer
            </h2>
            <p className="text-sm text-gray-400 leading-7">
              • Build scalable full-stack applications using React, Node.js,
              Express, and MongoDB
              <br />
              • Integrate real-time features and APIs with a focus on usability
              and performance
              <br />
              • Solve backend challenges like authentication, data validation,
              and cloud deployment
              <br />
              • Design clean, responsive UI with a keen eye for user experience
              <br />• Always exploring the latest in tech trends and development
              tools
            </p>
          </div>
        </div>
      </section>

      {/* Work Experience */}
      <section className="max-w-4xl mx-auto mt-24">
        <div className="border border-transparent hover:border-gray-700 hover:scale-105 transform transition-transform duration-300 p-4 rounded-md">
          <h3 className="text-center text-2xl font-bold uppercase mb-6">
            Work Experiences.
          </h3>
          <div>
            <p className="text-sm text-gray-400">2023 - 2023</p>
            <h4 className="text-xl font-semibold">Intern | Prime Solutions</h4>
            <p className="text-gray-300">
              Developed a full-stack Task Management web application using the
              MERN stack, incorporating modern UI/UX principles to ensure a
              clean and user-friendly interface.
            </p>
            <div className="flex gap-2 mt-2">
              {["HTML", "CSS", "JAVASCRIPT", "REACT"].map((skill) => (
                <span
                  key={skill}
                  className="bg-white text-black px-2 py-1 text-xs font-bold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="max-w-4xl mx-auto mt-24">
        <div className=" border border-transparent hover:border-gray-700 hover:scale-105 transform transition-transform duration-300 p-4 rounded-md">
          <h3 className="text-center text-2xl font-bold uppercase mb-6 ">
            Educations.
          </h3>
          <div>
            <p className="text-sm text-gray-400">2021 - 2025</p>
            <h4 className="text-xl font-semibold">
              Karpagam College of Engineering
            </h4>
            <p className="text-gray-300">
              Bachelor of Technology in Information Technology
            </p>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="max-w-5xl mx-auto mt-24 px-4">
        <div className="">
          <h3 className="text-center text-2xl font-bold uppercase mb-6">
            Projects.
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Quiz App",
                description:
                  "Interactive Quiz App designed with simplicity and fun in mind, making learning enjoyable.",
                tech: "HTML, CSS, JAVASCRIPT",
                glink: "https://github.com/leonRandip/Quiz-Site",
                url: "https://leonrandip.github.io/Quiz-Site/",
              },
              {
                title: "Personalised Chatbot",
                description:
                  "ChatGPT clone that uses OpenAI's API and GitHub token for personalized responses.",
                tech: "HTML, CSS, JAVASCRIPT",
                glink: "https://github.com/leonRandip/Personalised-Chatbot",
                url: "https://personalised-chatbot.vercel.app",
              },
              {
                title: "Ded-Lift",
                description:
                  "Fitness app calculating macro goals and personalized plans with intuitive workout handling.",
                tech: "MERN STACK",
                glink: "https://github.com/leonRandip/Ded-Lift",
                url: "https://ded-lift.vercel.app/",
              },
              {
                title: "SoulStitch",
                description:
                  "Emotional support platform designed with a metaphorical theme for inner balance.",
                tech: "REACT",
                glink: "https://github.com/leonRandip/SoulStitch",
                url: "https://soul-stitch.vercel.app/",
              },
              {
                title: "ScrollR3F",
                description:
                  "Scroll animation demo using @react-three/drei's ScrollControls for 3D interaction.",
                tech: "REACT, REACT THREE FIBER",
                glink: "https://github.com/leonRandip/ScrollR3F",
                url: "https://scroll-r3f.vercel.app",
              },
              {
                title: "Parkinsons Detection",
                description:
                  "Voice-based diagnostic app using ML & LSTM to detect Parkinson’s with real-time analysis.",
                tech: "PYTHON, FLASK",
                glink: "https://github.com/leonRandip/ParkinsonsDetection",
                url: "https://parkinsonsdetection.up.railway.app/",
              },
            ].map(({ title, description, tech, glink, url }) => (
              <div
                key={title}
                className="border border-gray-700 p-4 rounded-md hover:scale-105 transform transition-transform duration-300"
              >
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-bold">{title}</h4>
                  <a href={glink} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4" />
                  </a>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-sm text-gray-400 mt-1">{description}</p>
                <p className="text-xs mt-1 font-bold">{tech}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="max-w-5xl mx-auto mt-24 pb-12 px-4">
        <div className="">
          <h3 className="text-center text-2xl font-bold uppercase mb-1">
            What I Excel At.
          </h3>
          <h3 className="text-center text-2xl font-bold uppercase mb-6">
            Skills.
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "EXPRESSJS",
              "MONGODB",
              "SQL",
              "HTML",
              "CSS",
              "JAVASCRIPT",
              "REACT",
              "NODEJS",
            ].map((skill) => (
              <div
                key={skill}
                className="bg-white/10 backdrop-blur-sm text-white p-9 text-center rounded-md hover:bg-white/30 hover:scale-105 transform transition-transform duration-300"
              >
                <p className="font-bold">{skill}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 pb-6">
        <p>
          Coded in Visual Studio Code. Built with React.JS and Tailwind CSS.
        </p>
        <p className="mt-1">© Developed by Randip Leon</p>
      </footer>
    </main>
  );
}
