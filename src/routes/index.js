import React from "react";

import { Redirect } from "react-router-dom";
import Home from "../application/Home/Home";
import Recommed from "../application/Recommed/index";
import Singers from "../application/Singers/index";
import Singer from "../application/Singer/index";
import Rank from "../application/Rank/index";
import Album from "../application/Album/index";
import Search from '../application/Search/index';

export default [
  {
    path: "/",
    component: Home,
    routes: [
      {
        path: "/",
        exact: true,
        render: () => <Redirect to={"/recommend"}></Redirect>
      },
      {
        path: "/recommend",
        component: Recommed,
        routes: [
          {
            path: "/recommend/:id",
            component: Album
          }
        ]
      },
      {
        path: "/singers",
        component: Singers,
        routes: [
          {
            path: "/singers/:id",
            component: Singer
          }
        ]
      },
      {
        path: "/rank",
        component: Rank,
        routes: [
          {
            path: "/rank/:id",
            component: Album
          }
        ]
      },
      {
        path:'/search',
        component:Search,
        key:'search',
        exact:true
      }
    ]
  }
];
