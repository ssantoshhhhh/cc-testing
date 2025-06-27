import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaShieldAlt, FaClock, FaStar, FaGraduationCap, FaTools } from 'react-icons/fa';

const About = () => {
  const stats = [
    { number: '500+', label: 'Happy Students', icon: <FaUsers className="text-3xl" /> },
    { number: '50+', label: 'Equipment Items', icon: <FaTools className="text-3xl" /> },
    { number: '24/7', label: 'Support', icon: <FaClock className="text-3xl" /> },
    { number: '4.9', label: 'Rating', icon: <FaStar className="text-3xl" /> },
  ];

  const values = [
    {
      icon: <FaShieldAlt className="text-2xl" />,
      title: 'Quality & Safety',
      description: 'All equipment is thoroughly inspected and sanitized before each rental to ensure your safety and satisfaction.'
    },
    {
      icon: <FaClock className="text-2xl" />,
      title: 'Convenience',
      description: 'Easy online booking system with flexible rental periods to fit your academic schedule.'
    },
    {
      icon: <FaGraduationCap className="text-2xl" />,
      title: 'Student-Focused',
      description: 'Designed specifically for students with affordable pricing and campus-friendly policies.'
    },
    {
      icon: <FaStar className="text-2xl" />,
      title: 'Excellence',
      description: 'Committed to providing the best rental experience with premium equipment and excellent service.'
    }
  ];

  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Founder & CEO',
      description: 'Former engineering professor with 15+ years of academic experience.',
      image: 'https://via.placeholder.com/150x150?text=SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Operations Manager',
      description: 'Expert in logistics and student services with a passion for innovation.',
      image: 'https://via.placeholder.com/150x150?text=MC'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Customer Success',
      description: 'Dedicated to ensuring every student has a seamless rental experience.',
      image: 'https://via.placeholder.com/150x150?text=ER'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Campus Connect
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're revolutionizing how students access academic equipment. Our mission is to make 
            quality tools and supplies accessible to every student, promoting learning and innovation.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Campus Connect was born from a simple observation: students often struggle to access 
                the equipment they need for their studies. Whether it's a mini drafter for engineering 
                drawings or a lab apron for chemistry experiments, we believe every student should have 
                access to quality tools without the burden of ownership.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We're committed to building a sustainable, student-friendly platform that not only 
                provides access to equipment but also promotes responsible resource sharing and 
                environmental consciousness.
              </p>
              <Link
                to="/collection"
                className="btn-primary text-lg px-8 py-3 inline-flex items-center"
              >
                Explore Our Collection
              </Link>
            </div>
            <div className="relative">
              <div className="bg-green-100 rounded-2xl p-8">
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto bg-green-200 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🎓</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Empowering Students
                  </h3>
                  <p className="text-gray-600">
                    Making quality education accessible through affordable equipment rental
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-xl text-gray-600">
              Numbers that tell our story of growth and student satisfaction
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors duration-300">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">
              The passionate people behind Campus Connect
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-green-600 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who trust Campus Connect for their equipment rental needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-green-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Sign Up Now
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 