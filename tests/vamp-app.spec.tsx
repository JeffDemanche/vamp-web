import * as React from 'react';
import { ApolloErrorProvider, ApolloLoadingProvider, ApolloMockedProvider } from './test-utils/providers';
import { shallow, render } from 'enzyme';
import {VampApp} from '../view/component/vamp-app';


describe('Vamp App', () => {
    it('should work', ()=>{
        render(
            < ApolloLoadingProvider >
                <VampApp/>
            </ ApolloLoadingProvider>
        )
    });
});