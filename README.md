# H13-redstone-goats
**✨ 💖  SENG2021 💖  ✨**

# 💬 Requirements (v2)
The project requirements are split into two phases. Developing an API and developing the front-end application. 

**SaaS Category:** Order Creation

**Description:** Creates a standardised UBL order document from user-provided data. 

**Customisation Point:** Get data from an established contract (e.g. product type). 

Our task is to create an Order Creation API that is compliant / acts as a solution for the procurement category process of UBL that is used in the Business Industry.

# API Content

**Expected Input:** User, Payment, and Delivery data.

  - Buyer and Seller Personal Information (Name, Phone, Email, ID, Address, Item Order, User ID.)

  - Payment Information (Credit Card details, Bank Account details.)

  - Delivery Information (Postal Code, Location.)

  - Product Type (Item, Product ID, Size, Quantity, Description.)

**Expected Output:** Successful Order Placement.

  - A standardised UBL order document: based on the provided data (UBL XML document).

  - Email notification: Sent to both buyer and seller at order confirmation

# Value from a consumer’s perspective

From a Buyer’s perspective, this API is valuable as it allows a Buyer Customer Party to form a contractual obligation between the Seller-supplier party. As a result, they can create orders by inputting the product and specifying the quantity, size, and other important information with the Seller. Throughout the whole process, the consumer can view and receive the summarised order as an XML document. Additionally, if the buyers ever want to view previous orders, they can return and view their order history. 

From a Seller’s perspective, they will receive analytical data represented in both a typed report and visual graphs that will help provide valuable insights into their small to medium-sized distribution businesses.

Both consumers are promised an efficient algorithm that will make strong recommendations. This means that consumers who have made purchases can be recommended new products to purchase based on their most frequently used sellers, helping buyers know what to purchase and helping sellers get more reach across their offered products.. Additionally, the API will be able to support multiple file types, such as JSV, CSV, and JSON, to convert to XML. Any changes to the order can also be tracked through a version history feature by both the Seller and the Buyer, assuring that accidental modifications can be reversed. Order cannot be confirmed unless both parties are satisfied. 

We as a team promise efficient searching, fast performance, and strong recommendations regarding product types and information. Ultimately, we strive to give users from small to medium businesses a cost-effective solution that provides valuable analytical data.

from Digital Trade Project:

“ SMEs in collaborative networks focus on their core competencies and try to find complementary partners to compensate for the lack of competencies and cooperate to fit to tender or to run new product development”

The main motivation behind this project is to support small and medium-sized enterprises (SMEs) so that they can fully participate in Industry 4.0 emergent collaborations. Its main focus is in the area of business document exchanges between collaborating partners. In particular, SMEs need a cost-effective solution that is both open and flexible. This way, they can better leverage their existing assets, use components from different vendors, and be in control of the evolution of their e-invoicing solutions.”

# Non-functional requirements

**Usability & Documentation**

  - Provide clear API documentation using Swagger

  - Error messages must be descriptive and actionable.

**Security**

  - Regular, automated database backups should be implemented to prevent data loss or breaches

  - Enforce rate limits (e.g., 100 requests per minute per user)

**Performance & Scalability**

  - The API must handle at least 100 concurrent users without performance degradation.

  - Maintainability & Extensibility

  - The system must be modular, allowing easy integration of new features

  - Code should follow industry standards (RESTful API design)

# Constraints

**Technical & Performance:** These define the system’s operational efficiency, reliability and scalability

  - Limit user requests per minute to not overload the system

  - API responses must conform to UBL-compliant XML formats, and also have capability to convert to/from other file formats such as JSON, CSV, and JSV.

  - API should return meaningful error messages.

  - Minimal to zero bugs/errors to occur during use after deployment.

  - Support responsive use on multiple devices (phone, laptop, and PC)

  - At the current stage of development, the system must be able to handle a minimum of a couple hundred concurrent users at a time.

  - API should be optimised for speed, ensuring latency and fast response times

**Team:** This project involves team constraints, members have varying levels of expertise, with some being less experienced in specific fields than others. To maintain efficiency and productivity, efficient role assignment and task delegation must be done in a way that best suits each team member's abilities. 

Role allocation must be based on individual strengths and prioritise an equal load

Due to the unfamiliarity of many project components, the team must overcome the learning curve associated with programming, as well as the scrum methodology and project management tools such as Confluence and Jira.

A robust peer review process must be enforced for both documentation as well as code.

For conflict resolution, GitHub will be utilised for version control

**Data:** During this task, some data constraints exist that affect the operations of the whole project. As a team, we have to be aware of what data is distributed and shared. This may include:

  - User account limits: One email associated with each User / Account.

  - Product stock: Limited stock, minimum/maximum order quantities

  - Input validation:

  - User IDs should be authorised

  - API tokens must be valid

  - Correct data types for each parameter

  - OrderID should be in a specified format (eg, 5-number string or custom format like YYMMDD-XXX)

  - Data privacy and security must be handled in a way that complies with regulation

# Target Audience

Our team’s target audience consists of small—to medium-sized distribution businesses that seek to use an Order Creation API to convert their orders into an XML UBL-standardized document or create their own orders with a Seller. 

# Style
Our team will follow a few style conventions regarding general code, branch naming etc.

**Indentation:**
  - 2 spaces.

**Branch naming:**
  - iteration/Initials/Route Name/version

**Commit messages:**
  - [Initials][BUG/FIX/FEATURE/MERGE] reason for commit

**Naming:**
  - Camel case (e.g firstName, userPassword)