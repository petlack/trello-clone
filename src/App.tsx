import './App.css';
import Trello from './Trello';

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://127.0.0.1:5000/graphql',
  cache: new InMemoryCache(),
});

function App() {

  return (
    <ApolloProvider client={client}>
      <Trello />
    </ApolloProvider>
  )
}

export default App
