import React from 'react';
import { useParams } from 'react-router-dom';

function TafelDetailScreen() {
  const { id } = useParams();
  console.log(id)

  return (
    <div>
      <h1>Unique Page</h1>
      <p>Unique ID: {id}</p>
      {/* Use the id in your component as needed */}
    </div>
  );
}

export default TafelDetailScreen;
