import React, { useState, useEffect, useCallback, useRef } from "react";
import { connect } from "react-redux";
import LazyLoad, { forceCheck } from "react-lazyload";
import { CSSTransition } from "react-transition-group";
import {
  getHotKeyWords,
  changeEnterLoading,
  getSuggestList
} from "./store/actionCreators";
import MusicalNote from "../../baseUI/music-note/index";
import Loading from "./../../baseUI/loading/index";
import { getSongDetail } from "./../Player/store/actionCreators";
import { getName } from "../../api/utils";
import SearchBox from "./../../baseUI/search-box/index";
import {
  Container,
  ShortcuWrapper,
  HotKey,
  List,
  ListItem,
  SongItem
} from "./style";
import Scroll from "../../baseUI/scroll";

function Search(props) {
  const {
    hotList,
    enterLoading,
    suggestList: immutableSuggestList,
    songsCount,
    songsList: immutableSongsList
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

  const musicNoteRef = useRef();

  //由于是传递给子组件的，尽量用callback包裹，以使得在依赖未发生改变，始终给子组件相同的引用；
  const searchBack = useCallback(() => {
    setShow(false);
  }, []);

  useEffect(() => {
    setShow(true);
    //用了redux缓存
    if (!hotList.size) {
      getHotKeyWordsDispatch();
    }
  }, []);

  const handleQuery = q => {
    setQuery(q);
    if (!q) return;
    changeEnterLoadingDispatch(true);
    getSuggestListDispatch(q);
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

  const renderAlbum = () => {
    let albums = suggestList.playlists;
    if (!albums || !albums.length) return;
    return (
      <List>
        <h1 className="title">相关歌单</h1>
        {albums.map((item, index) => {
          return (
            <ListItem
              key={item.accountId + "" + index}
              onClick={() => props.history.push(`/album/${item.id}`)}
            >
              <div className="img_wrapper">
                <LazyLoad
                  placeholder={
                    <img
                      width="100%"
                      height="100%"
                      src={require("./music.png")}
                      alt="music"
                    />
                  }
                >
                  <img
                    src={item.coverImgUrl}
                    width="100%"
                    height="100%"
                    alt="music"
                  />
                </LazyLoad>
              </div>
              <span className="name">歌单:{item.name}</span>
            </ListItem>
          );
        })}
      </List>
    );
  };

  const renderSingers = () => {
    let singers = suggestList.artists;
    if (!singers || !singers.length) return;
    return (
      <List>
        <h1 className="title">相关歌手</h1>
        {singers.map((item, index) => {
          return (
            <ListItem
              key={item.accountId + "" + index}
              onClick={() => props.history.push(`/singers/${item.id}`)}
            >
              <div className="img_wrapper">
                <LazyLoad
                  placeholder={
                    <img
                      width="100%"
                      height="100%"
                      src={require("./singer.png")}
                      alt="singer"
                    />
                  }
                >
                  <img
                    src={item.picUrl}
                    width="100%"
                    height="100%"
                    alt="music"
                  />
                </LazyLoad>
              </div>
              <span className="name">歌手: {item.name}</span>
            </ListItem>
          );
        })}
      </List>
    );
  };

  const renderSongs = () => {
    return (
      <SongItem style={{ paddingLeft: "20px" }}>
        {songsList.map(item => {
          return (
            <li key={item.id} onClick={e => selectItem(e, item.id)}>
              <div className="info">
                <span>{item.name}</span>
                <span>
                  {getName(item.artists)} - {item.album.name}
                </span>
              </div>
            </li>
          );
        })}
      </SongItem>
    );
  };

  const selectItem = (e, id) => {
    getSongDetailDispatch(id);
    musicNoteRef.current.startAnimation({
      x: e.nativeEvent.clientX,
      y: e.nativeEvent.clientY
    });
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
      <Container play={songsCount}>
        <SearchBox
          back={searchBack}
          newQuery={query}
          handleQuery={handleQuery}
        ></SearchBox>
        <ShortcuWrapper show={!query}>
          <Scroll>
            <div>
              <HotKey>
                <h1 className="title">热门搜索</h1>
                {renderHotKey()}
              </HotKey>
            </div>
          </Scroll>
        </ShortcuWrapper>
        <ShortcuWrapper show={query}>
          <Scroll onScorll={forceCheck}>
            <div>
              {renderSingers()}
              {renderAlbum()}
              {renderSongs()}
            </div>
          </Scroll>
        </ShortcuWrapper>
        {enterLoading ? <Loading></Loading> : null}
        <MusicalNote ref={musicNoteRef}></MusicalNote>
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
    },
    getSongDetailDispatch(id) {
      dispatch(getSongDetail(id));
    }
  };
};

//将UI组件包裹成容器组件

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Search));
