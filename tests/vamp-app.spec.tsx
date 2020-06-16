import * as React from 'react';
import { ApolloErrorProvider, ApolloLoadingProvider, ApolloMockedProvider } from './test-utils/providers';
import { shallow, mount, render } from 'enzyme';
import {VampApp} from '../view/component/vamp-app';



describe('Vamp App', () => {
    it('should work', ()=>{
        render(
            < ApolloLoadingProvider >
                <h1>Hello world</h1>
            </ ApolloLoadingProvider>
        )
    });
});