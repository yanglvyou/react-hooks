import React, { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import { CSSTransition } from "react-transition-group";
import {
  getHotKeyWords,
  changeEnterLoading,
  getSuggestList
} from "./store/actionCreators";
import SearchBox from "./../../baseUI/search-box/index";
import { Container,ShortcuWrapper,HotKey } from "./style";
import Scroll from '../../baseUI/scroll';

function Search(props) {
  const {
    hotList,
    enterLoading,
    suggestList:immutableSuggestList,
    songsCount,
    songsList:immutableSongsList
  } = props;

  const suggestList = immutableSuggestList.toJS();
  const songsList = immutableSongsList.toJS();
  

  const {
    getHotKeyWordsDispatch,
    changeEnterLoadingDispatch,
    getSuggestListDispatch,
    getSongDetailDispatch
  } = props;

  const [query, setQuery] = useState("");
  //控制动画
  const [show, setShow] = useState(false);

  //由于是传递给子组件的，尽量用callback包裹，以使得在依赖未发生改变，始终给子组件相同的引用；
  const searchBack = useCallback(() => {
    setShow(false);
  }, []);

  useEffect(() => {
    setShow(true);
    //用了redux缓存
    if(!hotList.size){
      getHotKeyWordsDispatch();
    }
  }, []);

  const handleQuery = q => {
    setQuery(q);
    if(!q) return;
    changeEnterLoadingDispatch(true);
    // getSuggestListDispatch(q);
  };

  //当搜索框为空时
  const renderHotKey = () => {
    let list = hotList ? hotList.toJS() : [];
    return (
      <ul>
        {list.map(item => {
          return (
            <li
              className="item"
              key={item.first}
              onClick={() => setQuery(item.first)}
            >
              <span>{item.first}</span>
            </li>
          );
        })}
      </ul>
    );
  };

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
        <SearchBox
          back={searchBack}
          newQuery={query}
          handleQuery={handleQuery}
        ></SearchBox>
        <ShortcuWrapper show={!query}>
         <scroll>
           <div>
             <HotKey>
                <h1 className="title">热门搜索</h1>
                {renderHotKey()}
             </HotKey>
           </div>
         </scroll>
        </ShortcuWrapper>
      </Container>
    </CSSTransition>
  );
}

//映射Redux全聚德state到组件的props上
const mapStateToProps = state => ({
  hotList: state.getIn(["search", "hotList"]),
  enterLoading: state.getIn(["search", "enterLoading"]),
  suggestList: state.getIn(["search", "suggestList"]),
  songsCount: state.getIn(["player", "playList"]).size,
  songsList: state.getIn(["search", "songsList"])
});

//映射dispatch到props 上

const mapDispatchToProps = dispatch => {
  return {
    getHotKeyWordsDispatch() {
      dispatch(getHotKeyWords());
    },
    changeEnterLoadingDispatch(data) {
      dispatch(changeEnterLoading(data));
    },
    getSuggestListDispatch(data) {
      dispatch(getSuggestList(data));
    }
  };
};

//将UI组件包裹成容器组件

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Search));
