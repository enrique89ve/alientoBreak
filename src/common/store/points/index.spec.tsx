import reducer, { initialState, resetAct, fetchAct, fetchedAct, errorAct } from "./index";

import { pointTransactionsInstance } from "../../helper/test-helper";

let state = initialState;

it("1- default state", () => {
    expect(state).toMatchSnapshot();
});

it("2- fetchAct", () => {
    state = reducer(state, fetchAct(0));
    expect(state).toMatchSnapshot();
});

it("3- fetched", () => {
    const list = [...pointTransactionsInstance];
    state = reducer(state, fetchedAct("1.000", "2.000", list));
    expect(state).toMatchSnapshot();
});

it("4- resetAct", () => {
    state = reducer(state, resetAct());
    expect(state).toMatchSnapshot();
});

it("5- fetchAct", () => {
    state = reducer(state, fetchAct(10));
    expect(state).toMatchSnapshot();
});

it("6- errorAct", () => {
    state = reducer(state, errorAct());
    expect(state).toMatchSnapshot();
});
import React from "react";
import { shallow } from "enzyme";
import EntryLink from "./index";

describe("EntryLink", () => {
    const historyMock = { push: jest.fn() };
    const makePathMock = jest.fn();
    const afterClickMock = jest.fn();

    const defaultProps = {
        history: historyMock,
        makePath: makePathMock,
        afterClick: afterClickMock,
        entry: {
            category: "test-category",
            author: "test-author",
            permlink: "test-permlink",
        },
        children: <div>Test Children</div>,
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should render correctly", () => {
        const wrapper = shallow(<EntryLink {...defaultProps} />);
        expect(wrapper).toMatchSnapshot();
    });

    it("should handle click event", async () => {
        const wrapper = shallow(<EntryLink {...defaultProps} />);
        const instance = wrapper.instance() as EntryLink;

        const eventMock = {
            preventDefault: jest.fn(),
        };

        await (instance.clicked as unknown as (event: React.MouseEvent<HTMLElement, MouseEvent>) => Promise<void>)(eventMock);

        expect(eventMock.preventDefault).toHaveBeenCalled();
        expect(afterClickMock).toHaveBeenCalled();
        expect(makePathMock).toHaveBeenCalledWith(
            defaultProps.entry.category,
            defaultProps.entry.author,
            defaultProps.entry.permlink
        );
        expect(historyMock.push).toHaveBeenCalledWith(
            makePathMock.mock.results[0].value
        );
    });

    it("should handle click event with PartialEntry", async () => {
        const partialEntryProps = {
            ...defaultProps,
            entry: {
                ...defaultProps.entry,
                title: "test-title",
            },
        };

        const wrapper = shallow(<EntryLink {...partialEntryProps} />);
        const instance = wrapper.instance() as EntryLink;

        const eventMock = {
            preventDefault: jest.fn(),
        };

        const getPostMock = jest.fn().mockResolvedValueOnce(partialEntryProps.entry);
        jest.mock("../../helper/api", () => ({
            getPost: getPostMock,
        }));

        await instance.clicked(eventMock as unknown as React.MouseEvent<HTMLElement>);

        expect(eventMock.preventDefault).toHaveBeenCalled();
        expect(afterClickMock).toHaveBeenCalled();
        expect(getPostMock).toHaveBeenCalledWith(
            partialEntryProps.entry.author,
            partialEntryProps.entry.permlink
        );
        expect(makePathMock).toHaveBeenCalledWith(
            partialEntryProps.entry.category,
            partialEntryProps.entry.author,
            partialEntryProps.entry.permlink
        );
        expect(historyMock.push).toHaveBeenCalledWith(
            makePathMock.mock.results[0].value
        );
    });
});