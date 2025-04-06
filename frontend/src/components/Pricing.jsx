import { motion } from 'framer-motion';
import PriceCard from './PriceCard';
import '../styles/Pricing.css';

const Pricing = ({ variants }) => {
  const plans = [
    {
      title: "Starter",
      price: "$9.99/mo",
      features: [
        { text: "100 order limit", disabled: false },
        { text: "Standard Features", disabled: false },
        { text: "Recommendations", disabled: true},
        { text: "Advanced analytics", disabled: true }
      ],
      popular: false
    },
    {
      title: "Pro",
      price: "$29.99/mo",
      features: [
        { text: "Unlimited orders", disabled: false },
        { text: "Pro Features", disabled: false },
        { text: "Recommendations", disabled: false},
        { text: "Advanced analytics", disabled: false},
        { text: "Custom UI / Theme", disabled: false}
      ],
      popular: true
    },
    {
      title: "Premium",
      price: "$39.99/mo",
      features: [
        { text: "Unlimited orders", disabled: false },
        { text: "Pro Features", disabled: false },
        { text: "Priority support", disabled: false, tooltip: "24h response" },
        { text: "Improved Recommendations", disabled: false},
        { text: "Improved Advanced analytics", disabled: false },
        { text: "AI Chat Assistance", disabled: false }
      ],
      popular: false
    }
  ];

  return (
    <motion.section 
      id="pricing" 
      className="pricing"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={variants.fadeIn}
    >
      <motion.h2 variants={variants.itemVariants}>Flexible Pricing</motion.h2>
      <motion.div 
        className="pricing-cards"
        variants={variants.containerVariants}
      >
        {plans.map((plan, index) => (
          <PriceCard 
            key={index}
            plan={plan}
            variants={variants}
            index={index}
          />
        ))}
      </motion.div>
    </motion.section>
  );
};

export default Pricing;