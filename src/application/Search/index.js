import React, { useState, useEffect,useCallback } from "react";
import { CSSTransition } from "react-transition-group";
import SearchBox from './../../baseUI/search-box/index';
import { Container } from "./style";

function Search(props) {
   const [query,setQuery]=useState('');
  //控制动画
  const [show, setShow] = useState(false);

  //由于是传递给子组件的，尽量用callback包裹，以使得在依赖未发生改变，始终给子组件相同的引用；
  const searchBack=useCallback(()=>{
    setShow(false)
  },[]);


  useEffect(() => {
    setShow(true);
  }, []);

  const handleQuery=(q)=>{
      console.log('q: ', q);
      setQuery(q);
  }


  return (
    <CSSTransition
      in={show}
      timeout={300}
      appear={true}
      classNames="fly"
      unmountOnExit
      onExited={() => props.history.goBack()}
    >
      <Container>
        <SearchBox back={searchBack} newQuery={query} handleQuery={handleQuery}></SearchBox>
      </Container>
    </CSSTransition>
  );
}

export default Search;
