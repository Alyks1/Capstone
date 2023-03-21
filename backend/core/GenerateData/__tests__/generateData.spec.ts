import { Post } from "../../Types/Post";
import {getDateFromPosts} from "../generateData";

const testingPosts: Post[] = [ {
    text: "This is a test of 2020",
    imgSrc: "test",
    data: { date: "", trust: 0, pos: 0 },
},{
    text: "This is a test of 1889",
    imgSrc: "test",
    data: { date: "", trust: 0, pos: 0 },
},{
    text: "Something from the 4th-5th century CE",
    imgSrc: "test",
    data: { date: "", trust: 0, pos: 0 },
},{
    text: "Something from the 4th-5th century BC",
    imgSrc: "test",
    data: { date: "", trust: 0, pos: 0 },
},{
    text: "Something from the 4th-5th century AD",
    imgSrc: "test",
    data: { date: "", trust: 0, pos: 0 },
},{
    text: "Something from the 4th-5th century BCE",
    imgSrc: "test",
    data: { date: "", trust: 0, pos: 0 },
},{
    text: "Something from the 4th millennium BCE",
    imgSrc: "test",
    data: { date: "", trust: 0, pos: 0 },
},{
    text: "Something that is 4000 years old",
    imgSrc: "test",
    data: { date: "", trust: 0, pos: 0 },
}];

const testingPostsResult: Post[] = [ {
    text: "This is a test of 1889",
    imgSrc: "test",
    data: { date: "1889", trust: 3, pos: 0 },
},{
    text: "Something from the 4th-5th century CE",
    imgSrc: "test",
    data: { date: "400", trust: 5, pos: 0 },
},{
    text: "Something from the 4th-5th century BC",
    imgSrc: "test",
    data: { date: "-400", trust: 6, pos: 0 },
},{
    text: "Something from the 4th-5th century AD",
    imgSrc: "test",
    data: { date: "400", trust: 5, pos: 0 },
},{
    text: "Something from the 4th-5th century BCE",
    imgSrc: "test",
    data: { date: "-400", trust: 6, pos: 0 },
},{
    text: "Something from the 4th millennium BCE",
    imgSrc: "test",
    data: { date: "-3500", trust: 5, pos: 0 },
},{
    text: "Something that is 4000 years old",
    imgSrc: "test",
    data: { date: "-1977", trust: 4, pos: 0 },
}
];

describe("getDateFromPost", () => {
    it("should return a date", () => {
        const post = getDateFromPosts(testingPosts);
        expect(post.map((x) => x.data.date)).toEqual(testingPostsResult.map((x) => x.data.date));
    });
});