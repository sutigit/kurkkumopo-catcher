export const themes = [
    {
        // https://colorhunt.co/palette/fdfbee57b4ba015551fe4f2d
        primary: 0xfe4f2d,
        secondary: 0x015551,
        tertiary: 0x57b4ba,
        background: 0xfdfbee,
    },
    {
        // https://colorhunt.co/palette/222831393e4600adb5eeeeee
        primary: 0xeeeeee,
        secondary: 0x00adb5,
        tertiary: 0x393e46,
        background: 0x222831,
    },
    {
        // https://colorhunt.co/palette/b7b1f2fdb7eaffdcccfbf3b9
        primary: 0xfbf3b9,
        secondary: 0xffdccc,
        tertiary: 0xfdb7ea,
        background: 0xb7b1f2,
    },
    {
        // https://colorhunt.co/palette/ffc7c7ffe2e2f6f6f68785a2
        primary: 0x8785a2,
        secondary: 0xf6f6f6,
        tertiary: 0xffe2e2,
        background: 0xffc7c7,
    },
];

export interface Theme {
    primary: number;
    secondary: number;
    tertiary: number;
    background: number;
}

