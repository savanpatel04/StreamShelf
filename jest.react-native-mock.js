const React = require("react");

function hostComponent(name) {
  const Component = React.forwardRef((props, ref) =>
    React.createElement(name, { ...props, ref }, props.children),
  );
  Component.displayName = name;
  return Component;
}

const Pressable = hostComponent("Pressable");
const View = hostComponent("View");
const Text = hostComponent("Text");
const Image = hostComponent("Image");
const ScrollView = hostComponent("ScrollView");
const RefreshControl = hostComponent("RefreshControl");
const ActivityIndicator = hostComponent("ActivityIndicator");

const FlatList = React.forwardRef(
  ({ data = [], renderItem, ListHeaderComponent, ...props }, ref) =>
    React.createElement(
      "FlatList",
      { ...props, ref },
      ListHeaderComponent ? React.createElement(ListHeaderComponent) : null,
      data.map((item, index) =>
        React.createElement(
          React.Fragment,
          { key: item.id ?? index },
          renderItem({ item, index }),
        ),
      ),
    ),
);
FlatList.displayName = "FlatList";

const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) =>
    Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style,
};

module.exports = {
  ActivityIndicator,
  FlatList,
  Image,
  Platform: {
    OS: "web",
    select: (options) => options.web ?? options.default,
  },
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions: () => ({
    width: 1024,
    height: 768,
    scale: 1,
    fontScale: 1,
  }),
};
