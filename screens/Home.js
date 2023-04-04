import { StyleSheet, Text, View, Image, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Buffer } from "buffer";
import { FlatList } from "react-native";
import Icon from "../assets/buttonIcon.png";
import { useFonts } from "expo-font";
import { ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const [loaded] = useFonts({
    kimberley: require("../assets/fonts/kimbalt_.ttf"),
    RadioCanada: require("../assets/fonts/RadioCanada.ttf"),
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const storyResponse = await axios.get(
          "https://storyapi.isebarn.com/api/story"
        );

        const imageUrls = storyResponse.data.map(
          (story) =>
            `https://isebarn-vid.s3.eu-west-2.amazonaws.com/${story.id}/original`
        );
        const imageResponses = await Promise.all(
          imageUrls.map((url) =>
            axios.get(url, { responseType: "arraybuffer" })
          )
        );

        const base64Images = imageResponses.map((response) =>
          Buffer.from(response.data, "binary").toString("base64")
        );
        const storyName = storyResponse.data.map((story) => story.name);
        const combinedData = base64Images.map((url, index) => {
          return {
            name: storyName[index],
            imageUrl: url,
          };
        });
        setData(combinedData);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error(error);
      }
    };

    fetchData();
  }, []);

  if (!loaded) {
    return null;
  }

  const renderItem = ({ item, index }) => {
    const nextItem = data[index + 1];
    const nextItemName = nextItem ? nextItem.name : null;
    return (
      <>
        <View style={[styles.imageContainer]}>
          <ImageBackground
            source={{ uri: `data:image/png;base64,${item.imageUrl}` }}
          >
            <View style={styles.contentContainer}>
              <Text style={styles.storyName}>{item.name}</Text>
              {nextItemName && (
                <View style={styles.bottomContentContainer}>
                  <Text style={styles.nextStory}>Next Story</Text>
                  <Text style={styles.nextStoryName}>{nextItemName}</Text>
                  <Image style={styles.icon} source={Icon} />
                </View>
              )}
            </View>
          </ImageBackground>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <Text style={{ color: "black", fontSize: 20, letterSpacing: 2 }}>
          Loading...
        </Text>
      ) : (
        <FlatList
          data={data}
          renderItem={({ item, index }) => renderItem({ item, index })}
          showsVerticalScrollIndicator={false}
          // pagingEnabled={strue}
          decelerationRate={0.9}
        />
      )}
    </SafeAreaView>
  );
};

export default Home;
const styles = StyleSheet.create({
  container: {
    width: Dimensions.get("window").width,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: 0,
    margin: 0,
  },
  imageContainer: {
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
  },
  contentContainer: {
    justifyContent: "space-between",
    display: "flex",
    height: "100%",
    width: "100%",
    alignItems: "center",
  },
  bottomContentContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingBottom: 50,
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  storyName: {
    alignSelf: "center",
    fontFamily: "kimberley",
    color: "white",
    fontSize: 38,
    width: 298,
    height: 114.75,
    textAlign: "center",
    marginTop: 70,
  },
  nextStory: {
    alignSelf: "center",
    fontFamily: "RadioCanada",
    fontWeight: "400",
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  nextStoryName: {
    alignSelf: "center",
    fontFamily: "RadioCanada",
    fontWeight: "400",
    color: "white",
    fontSize: 28,
    textAlign: "center",
    marginVertical: 20,
  },
  icon: {
    alignSelf: "center",
    marginBottom: 40,
  },
});
