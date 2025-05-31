describe('page Load & UI Verification', () => {
    beforeEach(() => {
        cy.visit('https://demo.guru99.com/payment-gateway/purchasetoy.php')
    })

    it('verifies that the Amount field exists, is visible, and has a default value greater than zero.', () => {
        cy.get('h3').should('contain.text', 'Price: $20');  
        cy.get('h3').should('be.visible');
        cy.get('h3').invoke('text').then((text) => {
            const price = parseFloat(text.match(/([\d.]+)/)[1]);  
            expect(price).to.be.greaterThan(0)
        });
        cy.get('.special').click()
    })

    it('verifies that input fields for Card Number, Expiry Month, Expiry Year, and CVV Code are present and enabled.', () => {
        cy.visit('https://demo.guru99.com/payment-gateway/process_purchasetoy.php')
        cy.get('#card_nmuber').should('be.visible').and('not.be.disabled')
        cy.get('#month').should('be.visible').and('not.be.disabled')
        cy.get('#year').should('be.visible').and('not.be.disabled')
        cy.get('#cvv_code').should('be.visible').and('not.be.disabled')
    })

    it('verifies that the “Pay” button is visible and initially enabled', () => {
        cy.visit('https://demo.guru99.com/payment-gateway/process_purchasetoy.php')
        cy.get('.special').should('contain.value', 'Pay $0.00').should('be.visible').and('not.be.disabled')
    })
})

describe("Positive Flow: Valid Card Data", () => {
    beforeEach(() => {
        cy.visit('https://demo.guru99.com/payment-gateway/process_purchasetoy.php')
    })

    it('enters a valid test card number', () => {
        cy.get('#card_nmuber').type(2345678987654321)
        cy.get('#month').select(6)
        cy.get('#year').select('2025')
        cy.get('#cvv_code').type(124)
        cy.get('input[name="submit"]').click()
        cy.url().should('include', '/payment-gateway/genearte_orderid.php');
        cy.get('.table-wrapper h2').should('contain.text', 'Payment successfull!')
        cy.get('td h3').first().should('have.text', 'Order ID')
        cy.get('td h3').last().invoke('text').then((text) => {
            const order_id = parseInt(text.match(/([\d])+/))
            expect(order_id).to.be.greaterThan(0)
        })
    })
    
})