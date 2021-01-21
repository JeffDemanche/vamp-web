import { gql } from "@apollo/client";
import * as React from "react";
import CabMain from "../cab-main";
import { CAB_MAIN_QUERY } from "../cab-main";

export default { title: "Cab" };

export const cabMain = (): JSX.Element => (
  <div style={{ height: "150px", width: "400px" }}>
    <CabMain></CabMain>
  </div>
);

// cabMain.parameters = {
//   apolloClient: {
//     mocks: [
//       {
//         request: {
//           query: gql`
//             query GetCurrentUserId {
//               me {
//                 id
//               }
//             }
//           `
//         },
//         result: {
//           data: {
//             me: {
//               id: "user"
//             }
//           }
//         }
//       },
//       {
//         request: {
//           query: CAB_MAIN_QUERY,
//           variables: { vampId: "vamp", userId: "user" }
//         },
//         result: {
//           data: {
//             userInVamp: {
//               __typename: "UserInVamp",
//               id: "userInVamp",
//               cab: {
//                 __typename: "Cab",
//                 user: {
//                   __typename: "User",
//                   id: "user"
//                 },
//                 start: 0,
//                 duration: 2,
//                 loops: true
//               }
//             }
//           }
//         }
//       }
//     ]
//   }
// };

// cabMain.story = {
//   name: "Cab Main"
// };
