import React, { useMemo, useCallback } from 'react';

import Slider, { CustomArrowProps, Settings } from 'react-slick';

import 'slick-carousel/slick/slick.css'; 
import 'slick-carousel/slick/slick-theme.css';

import './styles.css';

interface ItemsProps{
  id: string;
  title: string;
  image_url: string;
}

interface CarouselProps {
  items: ItemsProps[];
  handleSelectItem(id: string): void; 
  selectedItems: string[];
}

const PreviousArrow = (props: CustomArrowProps) => {
  const { className, onClick, style } = props;

  return(
    <div
      className={className}
      style={{...style}}
      onClick={onClick}
    />
  )
}

const NextArrow = (props: CustomArrowProps) => {
  const { className, onClick, style } = props;

  return(
    <div
      className={className}
      style={{...style}}
      onClick={onClick}
    />
  )
}

const settings: Settings = {
  infinite: false,
  speed: 500,
  centerMode: false,
  slidesToShow: 3,
  slidesToScroll: 1,
  nextArrow: <NextArrow/>,
  prevArrow: <PreviousArrow/>,
  vertical: true,
  verticalSwiping: true,
}

const Carousel: React.FC<CarouselProps> = ({ items, selectedItems, handleSelectItem }) => {
  const selectedItemsHooked = useMemo(() => {
    return selectedItems;
  }, [selectedItems])

  const handleSelectItemHooked = useCallback((id: string) => {
    handleSelectItem(id);
  }, [handleSelectItem])

  return (
    <Slider {...settings} >
      {items.map(item => (
        <div 
          id='items'
          key={item.id}
          onClick={() => handleSelectItemHooked(item.id)}
          className={selectedItemsHooked.includes(item.id) ? 'selected' : ''}  
        >
          <div id='items-centering' >
            <img 
              src={item.image_url}
              alt={item.title}
            />
            <span>{item.title}</span>
          </div>
        </div>
      ))}
    </Slider>
  )
}

export default Carousel;