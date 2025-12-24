export interface BoardMembership {
    owns_board: boolean;
}

export interface UserBoardData {
    id: number;
    title: string;
    BoardMemberships: BoardMembership;
}

export interface UserData {
    username: string;
    email: string;
    is_admin: boolean;
    Boards: UserBoardData[];
}

export interface NoteData {
    id: number;
    title: string;
    content: string;
}

export interface CategoryData {
    id: number;
    title: string;
    createdAt?: string;
    updatedAt?: string;
    BoardId: number;
    Notes: NoteData[];
}

export interface BoardUserData {
    username: string;
    BoardMemberships: BoardMembership;
}

export interface BoardData {
    id: number;
    title: string;
    createdAt?: string;
    updatedAt?: string;
    Users: BoardUserData[];
    Categories: CategoryData[];
}

export interface InviteData {
    id: number;
    UserUsername: string;
    BoardId: number;
    sender: string;
    User: {
        username: string;
    };
    Board: {
        id: number;
        title: string;
    };
}
