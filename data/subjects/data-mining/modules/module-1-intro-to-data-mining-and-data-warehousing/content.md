# References

## Text Books and Other References

- Dunham M H, *Data Mining: Introductory and Advanced Topics*, Pearson Education, 2003
- Arun K Pujari, *Data Mining Techniques*, Universities Press Private Limited, 2008
- Jaiwei Han and Micheline Kamber, *Data Mining Concepts and Techniques*, Elsevier, 2006
- M Sudeep Elayidom, *Data Mining and Warehousing*, 1st Edition, 2015, Cengage Learning India Pvt. Ltd.
- Mehmed Kantardzic, *Data Mining Concepts, Methods and Algorithms*, John Wiley and Sons, 2003
- Pang-Ning Tan and Michael Steinbach, *Introduction to Data Mining*, Addison Wesley, 2006

# What Is Mining?

- Mining is the process of extraction of some valuable material from the earth.
- Examples: coal mining, diamond mining, etc.

# What Is Data Mining?

- Data mining is the exploration and analysis of large datasets in order to discover meaningful patterns and rules.
- The techniques of data mining are designed for, and work best with, large datasets.

# Data Mining Applications

## Healthcare

- to identify best practices that will enhance health care services and reduce costs.
- to forecast patients in each category.
- to ensure that the patients get intensive care at the right place and at the right time.
- enables healthcare insurers to recognize fraud and abuse.

## Market Basket Analysis

- a modeling method based on a hypothesis.
- If you buy a specific group of products, then you are more likely to buy another group of products.
- This technique may enable the retailer to understand the purchase behavior of a buyer.
- This data may assist the retailer in understanding the requirements of the buyer and altering the store's layout accordingly.

## Education

- Affirming student's future learning behavior, studying the impact of educational support, and promoting learning science.
- An organization can use data mining to make precise decisions and also to predict the results of the student.
- With the results, the institution can concentrate on what to teach and how to teach.

## Manufacturing Engineering

- To find patterns in a complex manufacturing process.
- To obtain the relationships between product architecture, product portfolio, and data needs of the customers.
- To forecast the product development period, cost, and expectations among the other tasks.

## Customer Relationship Management (CRM)

- CRM is all about obtaining and holding Customers, also enhancing customer loyalty and implementing customer-oriented strategies.
- To get a decent relationship with the customer, a business organization needs to collect data and analyze the data.
- With data mining technologies, the collected data can be used for analytics.

## Fraud Detection

- Data mining provides meaningful patterns, turning data into information.
- Supervised methods consist of a collection of sample records, and these records are classified as fraudulent or non-fraudulent.
- A model is constructed using this data, and the technique is made to identify whether the document is fraudulent or not.

## Lie Detection

- Law enforcement may use data mining techniques to investigate offenses, monitor suspected terrorist communications, etc.
- This technique includes text mining also, and it seeks meaningful patterns in data, which is usually unstructured text.
- The information collected from the previous investigations is compared, and a model for lie detection is constructed.

## Financial Banking

- The data mining technique can help bankers by solving business-related problems in banking and finance by identifying trends, casualties, and correlations in business information and market costs that are not instantly evident to managers or executives because the data volume is too large or are produced too rapidly on the screen by experts.
- The manager may find these data for better targeting, acquiring, retaining, segmenting, and maintain a profitable customer.

# Data Warehouse

- A data warehouse is a repository of information collected from multiple sources, stored under a unified schema, and usually residing at a single site.
- It is a huge historical database containing data that is mostly historic and not frequently updated.

**Examples**

- Social media websites such as Facebook, Twitter, and LinkedIn analyze large datasets and store data in a single central repository.
- Banks use data warehouses to study spending patterns of account and card holders.
- Governments use data warehouses to store and analyze tax payments and detect tax thefts.

# Database and OLTP Systems

- A database is a collection of data usually associated with some organization or enterprise.
- Data in a database usually has a particular structure or schema.
- Example schema: `(ID, Name, Address, Salary, JobNo)`.
- A database management system (DBMS) is the software used to access a database.
- A data model describes the data, attributes, and relationships among them.
- A common data model is the ER (entity-relationship) model.
- DBMS systems often view data in a structure more like a table, leading to the relational model.
- Access to databases is usually achieved via a query language such as SQL.

# How Is a Data Warehouse Different From a Database?

| Parameter | Database | Data Warehouse |
| --- | --- | --- |
| Purpose | Designed to record | Designed to analyze |
| Processing Method | Uses OLTP | Uses OLAP |
| Usage | Helps perform fundamental business operations | Allows business analysis |
| Orientation | Application-oriented collection of data | Subject-oriented collection of data |
| Storage Limit | Generally limited to a single application | Stores data from any number of applications |
| Availability | Data is available in real time | Data is refreshed from source systems as needed |
| Design | ER modeling techniques | Dimensional and normalized techniques |
| Data Type | Up-to-date data | Current and historical data |
| Storage | Flat relational approach | Dimensional and normalized approach such as star and snowflake schemas |
| Query Type | Simple transaction queries | Complex analytical queries |
| Data Summary | Detailed data | Highly summarized data |

# Data Warehouse Definition and Properties

A data warehouse is a subject-oriented, integrated, time-variant, and non-volatile collection of data in support of management's decision making process.

## Properties

- Subject-oriented: organized around major subjects such as customer, supplier, product, and sales.
- Integrated: constructed by integrating multiple heterogeneous sources such as relational databases, flat files, and online transaction records.
- Time-variant: data is stored to provide information from a historical perspective.
- Non-volatile: a physically separate store of data transformed from the operational environment.

# Database Example

A relational database for the company AllElectronics.

- It will be very difficult to analyze the company's sales since the relevant data are spread out over several databases, physically located at numerous sites.
- If AllElectronics had a data warehouse, this task would be easy.

# Data Warehouse Design

# Multidimensional Data Model

- The design of the data warehouse is based on a multidimensional view of the data model.
- The data set can be represented as a 2-D table.
- The example shows employment in California by gender, by year, and by profession.
- Multidimensional tables are popular in statistical data analysis.
- Rows and columns can represent more than one dimension when the dataset contains more than two dimensions.

# Data Cube

- A multidimensional view of the information is often shown as a data cube.
- The example has three dimensions: gender, profession, and year.
- Each dimension can be divided into subdimensions.
- In a multidimensional data model, the numeric measure is the main theme or subject of the analysis.
- In the example, the numeric measure is employment.
- Each numeric measure depends on a set of dimensions, which provide the context for the measure.
- All the dimensions together are assumed to uniquely determine the measure.
- A measure is viewed as a value placed in a cell in multidimensional space.
- Dimensions are the perspectives or entities with respect to which an organization wants to keep records.
- Each dimension is described by a set of attributes.
- The attributes of a dimension may be related via a hierarchy of relationships.

n-Dimensional Data Cube

An n-dimensional data cube `C[A1, A2, ..., An]` is a database with n dimensions `A1, A2, ..., An`, each of which represents a theme and contains a number of distinct elements in the dimension.

- Each distinct element corresponds to a data row of `C`.
- A data cell in the cube stores the numeric measures of the data for the chosen dimension values.
- A data cell corresponds to an instantiation of all dimensions.
- Example: `C[sex, profession, year]` is the data cube, and `C[male, civil engineer, 1992]` stores `2780` as its associated measure.
- As `|gender| = 2`, `|profession| = 6`, and `|year| = 5`, there are three dimensions with 2, 6, and 5 rows respectively.

# Lattice of Cuboids

- Multidimensional data can be viewed as a lattice of cuboids.
- The cube at the finest level of granularity is the base cuboid and consists of all the data cells.
- The remaining cubes are obtained by grouping cells and computing the combined numeric measure of a given dimension.
- The coarsest level consists of one cell with numeric measures of all dimensions; this is the apex cuboid.
- All other cuboids lie between the base cuboid and the apex cuboid.

## Basic Components

1. Summary measure: employment, sales, etc.
2. Summary function: sum.
3. Dimension: sex, year, profession, state.
4. Dimension hierarchy: professional class -> profession.

# Summary Measures

- The summary measure is the main theme of the analysis in a multidimensional model.
- A measure value is computed for a given cell by aggregating the data corresponding to the dimension-value sets defining the cell.
- Measures are categorized into three groups based on the aggregate function used.

## Distributive

- A numeric measure is distributive if it can be computed in a distributed manner.
- Examples: count, sum, min, max.

## Algebraic

- An aggregate function is algebraic if it can be computed by an algebraic function with arguments that are distributive measures.
- Example: average is obtained by sum/count.
- Standard deviation is another example.

## Holistic

- An aggregate function is holistic if there does not exist an algebraic function that can be used to compute it.
- Examples: median, mode, most-frequent.

# OLAP Operations

- The data analysis tools used to explore data are called OLAP (On-Line Analytical Processing).
- OLAP is mainly used to access live data online and analyze it.
- OLAP tools are designed for very large databases.

## Slicing

- Used for reducing the data cube by one or more dimensions.
- Performs a selection on one dimension of the given cube, resulting in a subcube.
- Example: `time = 'Q2'` gives `C[quarter, city, product] = C[city, product]`.

## Dicing

- Used for selecting a smaller data cube and analyzing it from different perspectives.
- Performs a selection on two or more dimensions.
- Example: `location = Mumbai or Pune` and `time = Q1 or Q2`.

## Drilling

- Used for moving up and down along classification hierarchies.

### Drill-up

- Switches from a detailed to an aggregated level within the same classification hierarchy.
- Also called roll-up.
- Performs aggregation by climbing up a dimension hierarchy or by dimension reduction.
- Example: aggregate by city to province.

### Drill-down

- Switches from an aggregated to a more detailed level within the same classification hierarchy.
- It is the reverse of roll-up.
- It can descend a hierarchy or introduce additional dimensions.
- Example: move from quarter to month or add customer type.

## Pivot (Rotate)

- A visualization operation that rotates the data axes to provide an alternative presentation of the same data.
- Examples include rotating the axes in a 3-D cube or transforming a 3-D cube into a series of 2-D planes.

# Warehouse Schema

- Schema is the logical description of the entire data warehouse.
- Data warehouses commonly use star, snowflake, and fact constellation schemas.

## Star Schema

- The warehouse contains a large central fact table and a set of smaller dimension tables, one for each dimension.
- The fact table contains detailed summary data.
- Its primary key has one key per dimension.
- Each dimension is a single, highly denormalized table.

## Snowflake Schema

- The dimension tables are normalized.
- Normalization splits the data into additional tables.
- A schema is a snowflake if one or more dimension tables do not connect directly to the fact table and must join through other dimension tables.
- Example: the item dimension table is normalized into item and supplier tables.

## Fact Constellation Schema

- A fact constellation has multiple fact tables sharing some dimension tables.
- It is also known as a galaxy schema.
- Example fact tables: sales and shipping.
- The shipping fact table can include dimensions such as item key, time key, shipper key, from location, and to location.
- Time, item, and location dimensions can be shared between fact tables.

# Data Warehouse Architecture

- The data warehouse architecture has three tiers.
- Tier 1 is the warehouse server.
- Tier 2 is the OLAP engine for analytical processing.
- Tier 3 is the client containing reporting, visualization, data mining, and querying tools.
- Backend processes extract, clean, transform, integrate, and refresh the warehouse.

## Tier 1: Warehouse Server Models

### Enterprise Warehouse

- Collects all information about the subjects across the entire organization.
- Provides corporate-wide data integration.
- Usually integrates one or more operational systems or external information providers.

### Data Marts

- Partitions of the overall data warehouse.
- Built specifically for a department or work group.
- May contain overlapping data.

Types:

- Stand-alone data mart: implemented with minimal or no impact on the enterprise's operational database.
- Dependent data mart: managed through enterprise data sources such as operational databases and external sources.

### Virtual Data Warehouse

- Creates a virtual view of databases instead of a physical warehouse.
- Provides a logical description of all databases and their structures.
- Lets users access distributed data through a single interface.
- Data is not moved from the sources.
- Access may be through SQL, view definitions, or data-access middleware.

## Metadata

- Metadata is a bridge between the data warehouse and decision support applications.
- It identifies the contents and location of data in the warehouse.
- It provides a catalog of data and pointers to that data.
- Metadata may also contain extraction and transformation history, column aliases, table sizes, usage statistics, hierarchies, formulas, security controls, update status, formatting information, sources, summary tables, and storage parameters.

## Metadata Repository Contents

- Warehouse structure descriptions such as schema, views, dimensions, hierarchies, derived data definitions, and mart contents.
- Operational metadata such as linkages, currency of data, monitoring information, error reports, and trails.
- Summarization processes such as dimension definition, partitions, summary measures, aggregation, and summarization.
- Source data such as source databases, contents, gateway descriptions, partitions, extraction, cleaning, transformation rules, and defaults.
- System performance information such as indices, profiles, refresh timing, update timing, and scheduling.
- Business metadata such as business terms, ownership information, and policies.

## Types of Metadata

### Build-Time Metadata

- Generated when a warehouse is designed and built.
- Describes the technical structure of the data.
- Used by warehouse designers, developers, and administrators.

### Usage Metadata

- Derived from build-time metadata.
- Useful to users and data administrators when the warehouse is in production.

### Control Metadata

- Used by databases and tools to manage their own operations.
- Helps track timeliness and timing of warehouse events.
- Mostly of interest to systems programmers.

## OLAP Engine

- Presents a multidimensional view of the data warehouse and provides tools for OLAP operations.

### Specialized SQL Server

- Assumes the warehouse organizes data in relational structure.
- Provides an SQL-like environment for OLAP tools.
- Exploits SQL capabilities.

### Relational OLAP (ROLAP)

- Data does not need to be stored multidimensionally to be viewed multidimensionally.
- A relational database provides storage and high-speed access.
- A middle analysis tier provides multidimensional conceptual views and analytical functionality.
- The presentation tier delivers results to users.

### Multidimensional OLAP (MOLAP)

- Uses a special-purpose multidimensional data model with a MOLAP server for analysis.
- Supports multidimensional views through array-based data warehouse servers.
- Maps multidimensional views of a data cube to array structures.
- Allows fast indexing to precompute summarized data.

## Data Warehouse Backend Process

- Data warehouse systems use backend tools and utilities to populate and refresh their data.

### Data Extraction

- Extracts data from sources such as production data, legacy data, internal office systems, external systems, and metadata.

### Data Cleaning

- Ensures that warehouse data is correct.
- Important because heterogeneous sources introduce errors.
- May use transformation rules, domain knowledge, parsing, fuzzy matching, and auditing.

### Data Transformation

- Transforms heterogeneous data to a uniform structure so the data can be combined and integrated.

### Loading

- Loads large volumes of time-varying data from multiple sources.
- May require rebuilding indices and summary tables.
- Should support monitoring, canceling, suspending, resuming, rate changes, and restart after failures.
- Strategies include batch loading, sequential loading, and incremental loading.

### Refresh

- Updates the warehouse when source data changes.
- Refresh can be immediate or periodic.
- Policies should be based on user needs and data traffic.

# Data Mining Concepts

- Data mining uses pattern recognition, mathematical techniques, and statistical techniques to identify patterns, trends, and useful data.
- It helps business decision making from large datasets.
- Data mining algorithms generally include three parts: model, preference, and search.

## Predictive and Descriptive Models

- Predictive models make predictions using known results from other data.
- Predictive tasks include classification, regression, time series analysis, and prediction.
- Descriptive models identify patterns or relationships rather than predicting new properties.
- Descriptive tasks include clustering, summarization, association rules, and sequence discovery.

# Knowledge Discovery in Databases (KDD)

- KDD is the process of identifying a valid, potentially useful, and ultimately understandable structure in data.
- Data mining is one step in the KDD process.
- The output of data mining should satisfy validity, understandability, utility, novelty, and interestingness.

# Stages in KDD

## Selection

- Selects or segments the data relevant to some criteria.
- Example: extract transaction types for credit card profiling.

## Preprocessing

- Cleans the data and removes unnecessary information.
- Reconfigures data to ensure a consistent format.
- Example: gender may be irrelevant in pregnancy studies.

## Transformation

- Transforms data so it is suitable for data mining.
- Makes the data usable and navigable.

## Data Mining

- Extracts patterns from the data.

## Interpretation and Evaluation

- Converts patterns into knowledge used to support decision making.

## Data Visualization

- Helps users examine large data volumes and detect patterns visually.
- Uses maps, charts, and other graphical representations.

# Architecture of a Data Mining System

## Data Source

- Databases, data warehouses, the World Wide Web, text files, and other documents.

## Different Processes

- Data must be cleaned, integrated, and selected before use.
- Raw data from different sources and formats cannot be used directly.

## Database or Data Warehouse Server

- Stores the original data ready to be processed.
- Retrieves relevant data based on user requests.

## Data Mining Engine

- Contains modules for association, characterization, classification, clustering, prediction, and time-series analysis.
- Uses instruments and software to extract insights from data.

## Pattern Evaluation Module

- Measures patterns using threshold values.
- Works with the data mining engine to focus on interesting patterns.

## Graphical User Interface

- The GUI communicates between the user and the system.
- Lets the user specify a query or task and view results.

## Knowledge Base

- Guides search and evaluation of patterns.
- May contain user views and experience-based data.
- Helps the system produce more accurate and reliable results.

# Data Mining Functionalities

## Classification

- Maps data into predefined groups or classes.
- A supervised learning task.
- Describes classes using known attribute values and characteristics.

## Regression

- Maps a data item to a real-valued prediction variable.
- Learns the function that performs this mapping.
- Uses error analysis to determine the best function.

## Time Series Analysis

- Examines how an attribute varies over time.
- Often uses evenly spaced time points such as daily, weekly, or hourly data.
- Can measure similarity, study behavior, or predict future values.

## Prediction

- Predicts future data states based on past and current data.
- Similar to classification, but focused on a future state.

## Clustering

- Groups are not predefined but are defined by the data itself.
- Also called unsupervised learning or segmentation.
- Partitions data into groups based on similarity.

## Summarization

- Maps data into subsets with simple descriptions.
- Also called characterization or generalization.
- Extracts representative information about the database.

## Association Rules

- Identifies specific types of data associations.
- Used in retail sales to find items frequently purchased together.
- Common in market basket analysis.

## Sequence Discovery

- Determines sequential patterns in data.
- Based on a time sequence of actions.
- Unlike market basket analysis, the relationship is based on time.

# Data Mining Issues

## Human Interaction

- Interfaces may be needed with both domain and technical experts.
- Technical experts help formulate queries and interpret results.
- Users help identify training data and desired results.

## Overfitting

- A model may fit the current database state but not future states.
- Can result from assumptions or a small training database.

## Outliers

- Some data entries do not fit nicely into the derived model.
- Including them may hurt performance on normal data.

## Interpretation of Results

- Data mining output may require expert interpretation.
- Otherwise the results may be meaningless to average users.

## Visualization of Results

- Visual displays help users understand output more easily.

## Large Datasets

- Very large datasets create scalability problems.
- Sampling and parallelization help address this.

## High Dimensionality

- Many attributes may be present, but not all are needed.
- Some attributes may interfere with the task or reduce efficiency.
- This is the dimensionality curse.
- Dimensionality reduction is one solution.

## Multimedia Data

- Traditional algorithms target numeric, character, and text data.
- Multimedia data can complicate or invalidate many algorithms.

## Missing Data

- Missing values may be replaced with estimates during preprocessing.
- This can lead to invalid results in the data mining step.

## Irrelevant Data

- Some attributes might not be of interest to the task.

## Noisy Data

- Some attribute values might be invalid or incorrect.
- These values are often corrected before running mining applications.

## Changing Data

- Databases cannot be assumed to be static.
- Many algorithms assume a static database and must be rerun when the database changes.
