import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import Trello from './Trello';

import './App.css';

const client = new ApolloClient({
  uri: import.meta.env.VITE_API_URL,
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Trello />
    </ApolloProvider>
  );
}

export default App;
