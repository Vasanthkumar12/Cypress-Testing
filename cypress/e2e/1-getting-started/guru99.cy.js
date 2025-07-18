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

// Negative Flow: Empty Fields

describe('Negative Flow: Empty Fields', () => {
    beforeEach(() => {
        cy.visit('https://demo.guru99.com/payment-gateway/process_purchasetoy.php')
    })

    it('should not submit when all fields are empty', () => {
        cy.get('input[name="submit"]').click()
        cy.url().should('include', '/process_purchasetoy.php')
    })

    it('should not submit when card number is blank', () => {
        cy.get('#month').select('6')
        cy.get('#year').select('2026')
        cy.get('#cvv_code').type('123')
        cy.get('input[name="submit"]').click()
        cy.url().should('include', '/process_purchasetoy.php')
    })

    it('should not submit when expiry month is blank', () => {
        cy.get('#card_nmuber').type('4111111111111111')
        cy.get('#year').select('2026')
        cy.get('#cvv_code').type('123')
        cy.get('input[name="submit"]').click()
        cy.url().should('include', '/process_purchasetoy.php')
    })

    it('should not submit when expiry year is blank', () => {
        cy.get('#card_nmuber').type('4111111111111111')
        cy.get('#month').select('6')
        cy.get('#cvv_code').type('123')
        cy.get('input[name="submit"]').click()
        cy.url().should('include', '/process_purchasetoy.php')
    })

    it('should not submit when CVV is blank', () => {
        cy.get('#card_nmuber').type('4111111111111111')
        cy.get('#month').select('6')
        cy.get('#year').select('2026')
        cy.get('input[name="submit"]').click()
        cy.url().should('include', '/payment-gateway/genearte_orderid.php').should('not.include', '/process_purchasetoy.php')
    })
})

// Negative Flow: Invalid Card Number
describe('Negative Flow: Invalid Card Number', () => {
    beforeEach(() => {
        cy.visit('https://demo.guru99.com/payment-gateway/process_purchasetoy.php')
    })

    it('should show error for non-numeric card number', () => {
        cy.get('#card_nmuber').type('abcdxyz')
        cy.get('#month').select('6')
        cy.get('#year').select('2026')
        cy.get('#cvv_code').type('123')
        cy.get('input[name="submit"]').click()
        cy.url().should('include', '/process_purchasetoy.php')
    })

    it('should show error for too short card number', () => {
        cy.get('#card_nmuber').type('1234')
        cy.get('#month').select('6')
        cy.get('#year').select('2026')
        cy.get('#cvv_code').type('123')
        cy.get('input[name="submit"]').click()
        cy.url().should('include', '/process_purchasetoy.php')
    })
})

// Negative Flow: Expired Card
describe('Negative Flow: Expired Card', () => {
    beforeEach(() => {
        cy.visit('https://demo.guru99.com/payment-gateway/process_purchasetoy.php')
    })

    it('should not allow expired year', () => {
        cy.get('#card_nmuber').type('4111111111111111')
        cy.get('#month').select('6')
        cy.get('#year').select('2020')
        cy.get('#cvv_code').type('123')
        cy.get('input[name="submit"]').click()
        cy.url().should('include', '/payment-gateway/genearte_orderid.php').should('not.include', '/process_purchasetoy.php')
    })

    it('should not allow expired month in same year', () => {
        cy.get('#card_nmuber').type('4111111111111111')
        cy.get('#month').select('1')
        cy.get('#year').select('2024')
        cy.get('#cvv_code').type('123')
        cy.get('input[name="submit"]').click()
        cy.url().should('include', '/payment-gateway/genearte_orderid.php').should('not.include', '/process_purchasetoy.php')
    })
})

// Negative Flow: Invalid CVV
describe('Negative Flow: Invalid CVV', () => {
    beforeEach(() => {
        cy.visit('https://demo.guru99.com/payment-gateway/process_purchasetoy.php')
    })

    it('should reject short CVV', () => {
        cy.get('#card_nmuber').type('4111111111111111')
        cy.get('#month').select('6')
        cy.get('#year').select('2026')
        cy.get('#cvv_code').type('12')
        cy.get('input[name="submit"]').click()
        cy.url().should('include', '/payment-gateway/genearte_orderid.php').should('not.include', '/process_purchasetoy.php')
    })

    it('should reject non-numeric CVV', () => {
        cy.get('#card_nmuber').type('4111111111111111')
        cy.get('#month').select('6')
        cy.get('#year').select('2026')
        cy.get('#cvv_code').type('abc')
        cy.get('input[name="submit"]').click()
        cy.url().should('include', '/payment-gateway/genearte_orderid.php').should('not.include', '/process_purchasetoy.php')
    })
})

// Data Persistence / Form Reset (Optional)
describe('Form Reset / Data Persistence', () => {
    it('should clear the form after success', () => {
        cy.visit('https://demo.guru99.com/payment-gateway/process_purchasetoy.php')
        cy.get('#card_nmuber').type('4111111111111111')
        cy.get('#month').select('6')
        cy.get('#year').select('2026')
        cy.get('#cvv_code').type('123')
        cy.get('input[name="submit"]').click()

        cy.url().should('include', '/payment-gateway/genearte_orderid.php')

        // Navigate back
        cy.go('back')
        // cy.get('#card_nmuber').should('have.value', '')
    })
})