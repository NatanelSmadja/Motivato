import React from 'react'
import Hero from '../../components/HomePage/Hero/Hero'
import Companies from '../../components/HomePage/Companies/Companies'
import Achievement from '../../components/HomePage/Achievement/Achievement'
import Categories from '../../components/HomePage/Categories/Categories,'
import Feedback from '../../components/HomePage/Feedback/Feedback'
import Footer from '../../components/Footer/Footer'
import Joinus from '../../components/HomePage/Joinus/Joinus'
import AboutUs from '../../components/HomePage/AboutUs/AboutUs'

const Home = () => {
  return (
    <>
    <Hero/>
    <Companies/>
    <AboutUs/>
    <Achievement />
    <Categories/>
    <Feedback/>
    <Joinus/>
    <Footer/>
    </>
  )
}

export default Home