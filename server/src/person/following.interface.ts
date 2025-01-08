interface FollowedPerson {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    description: string;
    hobby: string[];
    image: string;
    createdAt: Date;
}

interface Following {
    id: number;
    createdAt: Date;
    followerId: number;
    followedId: number;
    followed: FollowedPerson;
}