import styled from "styled-components";
import style from "../../assets/global-style";

export const SliderContainer = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  margin: auto;
  background-color: white;
  .before {
    position: absolute;
    top: 0;
    height: 60%;
    width: 100%;
    background-color: ${style["theme-color"]};
  }
  .slider-container{
      position:relative;
      width: 98%;
      height: 160px;
      overflow:hidden;
      margin:auto;
      border-radius:6px;
  }
  .swiper-pagination-bullet-active{
      background-color:${style["theme-color"]};
  }
`;
