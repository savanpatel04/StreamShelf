import type { Title } from '../types';

export type DetailParams = {
  titleId: string;
  preview?: Title;
};

export type HomeStackParamList = {
  HomeFeed: undefined;
  Detail: DetailParams;
};

export type MyListStackParamList = {
  MyListFeed: undefined;
  Detail: DetailParams;
};

export type RootTabParamList = {
  HomeTab: { screen: keyof HomeStackParamList } | undefined;
  MyListTab: { screen: keyof MyListStackParamList } | undefined;
};
