import { motion } from 'framer-motion';
import '../styles/Contact.css';

const Contact = ({ variants }) => {
  return (
    <motion.section 
      id="contact" 
      className="contact"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={variants.fadeIn}
    >
      <motion.h2 
        variants={variants.itemVariants}
        className="contact-title"
      >
        Contact Us
      </motion.h2>
      <motion.form 
        className="contact-form"
        variants={variants.containerVariants}
      >
        <motion.input 
          type="text" 
          placeholder="Your Name"
          variants={variants.itemVariants}
          whileFocus={{ 
            scale: 1.02, 
            boxShadow: "0 0 0 2px rgba(198, 40, 40, 0.3)",
            borderColor: "#c62828"
          }}
        />
        <motion.input 
          type="email" 
          placeholder="Your Email"
          variants={variants.itemVariants}
          whileFocus={{ 
            scale: 1.02, 
            boxShadow: "0 0 0 2px rgba(198, 40, 40, 0.3)",
            borderColor: "#c62828"
          }}
        />
        <motion.textarea 
          placeholder="Your Message"
          variants={variants.itemVariants}
          whileFocus={{ 
            scale: 1.02, 
            boxShadow: "0 0 0 2px rgba(198, 40, 40, 0.3)",
            borderColor: "#c62828"
          }}
        ></motion.textarea>
        <motion.button 
          type="submit" 
          className="cta-button"
          variants={variants.itemVariants}
          whileHover={{ 
            scale: 1.05, 
            boxShadow: "0 5px 15px rgba(198, 40, 40, 0.4)",
            backgroundColor: "#b71c1c"
          }}
          whileTap={{ scale: 0.95 }}
        >
          Send Message
        </motion.button>
      </motion.form>
    </motion.section>
  );
};

export default Contact;