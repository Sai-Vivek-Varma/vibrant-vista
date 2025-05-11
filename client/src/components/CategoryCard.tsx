
import { Link } from "react-router-dom";
import { useInView } from "@/hooks/useInView";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

interface CategoryCardProps {
  name: string;
  count: number;
  image: string;
}

const CategoryCard = ({ name, count, image }: CategoryCardProps) => {
  const [ref, isInView] = useInView({ 
    once: true,
    threshold: 0.2
  });

  // Use the provided count directly instead of making an API call
  // This avoids 404 errors when the API endpoint doesn't exist yet
  const postsCount = count || 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Link to={`/categories/${name}`} className='block group'>
        <div className='relative h-44 sm:h-48 md:h-52 rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md'>
          <div
            className='absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110'
            style={{ backgroundImage: `url(${image})` }}
          >
            <div className='absolute inset-0 bg-gradient-to-b from-black/60 to-black/80'></div>
          </div>

          <div className='relative h-full flex flex-col items-center justify-center text-white p-6'>
            <h3 className='text-xl font-bold font-serif mb-1'>{name}</h3>
            <p className='text-white/80 text-sm'>
              {postsCount} {postsCount === 1 ? "Post" : "Posts"}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
