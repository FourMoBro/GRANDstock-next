import { gql } from "apollo-server-micro"

const typeDefs = gql`

type Query {
    earningsWeekSearch(startDate: String!, endDate:String!): [EarningsWeekSearchResult] @cypher(
        statement:""" 
            WITH apoc.static.get('finnhub.url') + '/calendar/earnings?from=' + $startDate + '&to=' + $endDate +'&token=' + apoc.static.get('finnhub.api') AS URL
            CALL apoc.load.json(URL) YIELD value
            UNWIND value.earningsCalendar AS earning
            RETURN {
                symbol: earning.symbol,
                date: earning.date
            }
        """)
    currentUser: User
        @cypher(
            statement: """
            MATCH (u:User {id: $auth.jwt.id})
            RETURN u
            """
        )
}

type EarningsWeekSearchResult {
    symbol: String
    date: String
}

type Equity {
    name: String
    symbol: String
    type: String
    dividends: [Dividend] @relationship(type: "HAS_DIV", direction: OUT)
    earnings: [Earnings] @relationship(type: "HAS_EARN", direction: OUT)
}
type Dividend {
    exDate: DateTime @ignore
    amount: Float
    equity: Equity @relationship(type: "HAS_DIV", direction: IN)
}
type Earnings {
    date: DateTime @ignore
    epsEst: Float
    epsAct: Float
    revEst: Float
    revAct: Float
    hour: String
    equity: Equity @relationship(type: "HAS_EARN", direction: IN)

}
type AuthToken @exclude {
    token: String!
}

type User {
  username: String
  id: ID!
  password: String! @private
}

type Mutation {
    signup(username: String!, password: String!): AuthToken
    login(username: String!, password: String!): AuthToken
}

`;

export default typeDefs