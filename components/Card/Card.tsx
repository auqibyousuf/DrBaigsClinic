import Image from 'next/image';
import { CardProps } from '@/types/component.types';

const Card: React.FC<CardProps> = ({
  title,
  description,
  image,
  children,
  className = '',
}) => {
  return (
    <article className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${className}`}>
      {image && (
        <div className="relative h-48 w-full" aria-hidden="true">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={image?.startsWith('http') && !image.includes('localhost')}
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
        {children}
      </div>
    </article>
  );
};

export default Card;
