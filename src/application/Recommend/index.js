import React, { useEffect } from "react";
import { forceCheck } from "react-lazyload";
import {renderRoutes} from 'react-router-config';
import Slider from "../../components/slider/index";
import Loading from "../../baseUI/loading/index";
import { connect } from "react-redux";
import * as actionTypes from "./store/actionCreators";
import Scroll from "../../baseUI/scroll/index";
import RecommendList from "../../components/list";
import { Content } from "./style";

function Recommend(props) {
  console.log('props: ', props);
  const { bannerList, recommendList, enterLoading ,songsCount} = props;
  const { getBannerDataDispatch, getRecommendListDataDispatch } = props;

  useEffect(() => {
    if (!bannerList.size) {
      getBannerDataDispatch();
    }
    if (!recommendList.size) {
      getRecommendListDataDispatch();
    }
  }, []);

  const bannerListJS = bannerList ? bannerList.toJS() : [];
  const recommendListJS = recommendList ? recommendList.toJS() : [];

  return (
    <Content play={songsCount}>
      <Scroll onScroll={forceCheck}>
        <div>
          <Slider bannerList={bannerListJS}></Slider>
          <RecommendList recommendList={recommendListJS}></RecommendList>
        </div>
      </Scroll>
      {enterLoading ? <Loading></Loading> : null}
      {renderRoutes(props.route.routes)}
    </Content>
  );
}
const mapStateToProps = state => ({
  bannerList: state.getIn(["recommend", "bannerList"]),
  recommendList: state.getIn(["recommend", "recommendList"]),
  enterLoading: state.getIn(["recommend", "enterLoading"]),
  songsCount: state.getIn(["player", "playList"]).size,
});

const mapDispatchToProps = dispatch => {
  return {
    getBannerDataDispatch() {
      dispatch(actionTypes.getBannerList());
    },
    getRecommendListDataDispatch() {
      dispatch(actionTypes.getRecommendList());
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(Recommend));
