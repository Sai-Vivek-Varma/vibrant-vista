import { Link } from "react-router-dom";

interface CategoryCardProps {
  name: string;
  count: number;
  image: string;
}

const CategoryCard = ({ name, count, image }: CategoryCardProps) => {
  return (
    <Link to={`/categories/${name}`} className='block group'>
      <div className='relative h-44 rounded-xl overflow-hidden'>
        <div
          className='absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110'
          style={{ backgroundImage: `url(${image})` }}
        >
          <div className='absolute inset-0 bg-gradient-to-b from-black/50 to-black/70'></div>
        </div>

        <div className='relative h-full flex flex-col items-center justify-center text-white p-6'>
          <h3 className='text-xl font-bold font-serif mb-1'>{name}</h3>
          <p className='text-white/80 text-sm'>
            {count} {count === 1 ? "Post" : "Posts"}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
