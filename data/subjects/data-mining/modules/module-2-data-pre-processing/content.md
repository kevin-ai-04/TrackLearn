## Syllabus


Data Preprocessing: Need of Data Preprocessing, Data Cleaning- Missing values, Noisy
data, Data integration, Data transformation, Data Reduction-Data cube aggregation,
Attribute subset selection, Data Reduction-Dimensionality reduction, Numerosity
reduction, Discretization and concept hierarchy generation.

## Introduction


- Today’s real-world databases are highly susceptible to noisy, missing, and inconsistent data due to
    their typically huge size (often several gigabytes or more) and their likely origin from multiple,
    heterogenous sources.
- Low-quality data will lead to low-quality mining results.
- How can the data be pre-processed in order to help improve the quality of the data and, consequently,
    of the mining results?
- How can the data be pre-processed so as to improve the efficiency and ease of the mining process?”

## Data Quality: Why Preprocess the Data?

**Elements defining data quality:**
### 1. Accuracy

### 2. Completeness, and

### 3. Consistency

### 1. Inaccurate data

- having incorrect attribute values
**Possible Reasons:**
- **i. The data collection instruments used may be faulty.**

ii. There may have been human or computer errors occurring at data entry.
iii. Users may purposely submit incorrect data values for mandatory fields when they
do not wish to submit personal information (e.g., by choosing the default value
“January 1” displayed for birthday). This is known as disguised missing data.
iv. Errors in data transmission can also occur. There may be technology limitations
such as limited buffer size for coordinating synchronized data transfer and
consumption.
v. Incorrect data may also result from inconsistencies in naming conventions or data
codes, or inconsistent formats for input fields (e.g., date).

### 2. Incomplete data

**Possible Reasons:**
- Attributes of interest may not always be available, such as customer information for
    sales transaction data.
- Other data may not be included simply because they were not considered important at
    the time of entry.
- Relevant data may not be recorded due to a misunderstanding or because of
    equipment malfunctions.
### 3. Inconsistent data

- Data that were inconsistent with other recorded data may have been deleted.
- Furthermore, the recording of the data history or modifications may have been
    overlooked.

**Two other factors affecting data quality are:**
        - believability and
        - Interpretability

- Believability reflects how much the data are trusted by users
- Interpretability reflects how easy the data are understood.

## Major Tasks in Data Preprocessing


- Data cleaning
- Data integration
- Data reduction and
- Data transformation

### 1. DATA CLEANING/CLEANSING

- If users believe the data are dirty, they are unlikely to trust
    the results of any data mining that has been applied.

- Furthermore, dirty data can cause confusion for the mining
    procedure, resulting in unreliable output.

- Data cleaning routines work to “clean” the data by:
                  - filling in missing values,
                  - smoothing noisy data,
                  - identifying or removing outliers, and
                  - resolving inconsistencies

### 1.1 Missing values

The following methods are used to fill in the missing values for an attribute:
### 1. Ignore the tuple:

- Usually done when the class label is missing (assuming the mining task involves classification).
- This method is not very effective, unless the tuple contains several attributes with missing values.
- By ignoring the tuple, we do not make use of the remaining attributes’ values in the tuple. Such data could have been useful to
    the task at hand.

### 2. Fill in the missing value manually:

- This approach is time consuming and may not be feasible given a large data set with many missing values.

### 3. Use a global constant to fill in the missing value:

- Replace all missing attribute values by the same constant such as a label like “Unknown” or −∞.
- If missing values are replaced by, say, “Unknown,” then the mining program may mistakenly think that they form an interesting
    concept, since they all have a value in common—that of “Unknown.”
- Hence, although this method is simple, it is not foolproof.

4. Use a measure of central tendency for the attribute (e.g., the mean or median) to fill in the missing value:
- For normal (symmetric) data distributions, the mean can be used, while skewed data distribution should employ the
    median.
- For example, suppose that the data distribution regarding the income of AllElectronics customers is symmetric and that the
    mean income is $56,000. Use this value to replace the missing value for income.


5. Use the attribute mean or median for all samples belonging to the same class as the given tuple:
- For example, if classifying customers according to credit risk, we may replace the missing value with the mean income
    value for customers in the same credit risk category as that of the given tuple.
- If the data distribution for a given class is skewed, the median value is a better choice.


### 6. Use the most probable value to fill in the missing value:

- This may be determined with regression, inference-based tools using a Bayesian formalism, or decision tree induction.
- For example, using the other customer attributes in your data set, you may construct a decision tree to predict the missing
    values for income.

- Methods 3 through 6 bias the data—the filled-in value may not be correct.
- Method 6, however, is a popular strategy.
- In comparison to the other methods, it uses the most information from the present data
    to predict missing values.
- By considering the other attributes’ values in its estimation of the missing value for
    income, there is a greater chance that the relationships between income and the other
    attributes are preserved.

### 1.2 Noisy Data


- Noise is a random error or variance in a measured variable.
- Methods of data visualization can be used to identify
    outliers, which may represent noise.
**Methods to smooth out data and reduce noise:**
- **i.   Binning:**

     - Binning methods smooth a sorted data value by
    consulting its “neighborhood,” that is, the values
    around it.
     - The sorted values are distributed into a number of
    “buckets,” or bins.
     - Because binning methods consult the neighborhood of
    values, they perform local smoothing.

**Smoothing by bin means:**
- In smoothing by bin means, each value in a bin is replaced by the
    mean value of the bin.
- For example, the mean of the values 4, 8, and 15 in Bin 1 is 9.
- , each original value in this bin is replaced by the value 9.


**Smoothing by bin medians:**
- Similarly, smoothing by bin medians can be employed, in which each
    bin value is replaced by the bin median.


**Smoothing by bin boundaries:**
- In smoothing by bin boundaries, the minimum and maximum values
    in a given bin are identified as the bin boundaries.
- Each bin value is then replaced by the closest boundary value.

## Question 1

### The following data is given(in increasing order) for the attribute age:

13, 15, 16, 16, 19, 20, 20, 21, 22, 22, 25, 25, 25, 25, 30, 33, 33, 35, 35, 35, 35, 36, 40, 45, 46, 52, 70.
Use smoothing by bin means to smooth these data, using a bin depth of 3. Illustrate your steps. Comment on the effect of this
technique for the given data.

- **ii. Regression:**

- A technique that conforms data values to a function.
- Linear regression involves finding the “best” line to fit two attributes
    (or variables) so that one attribute can be used to predict the other.
- Multiple linear regression is an extension of linear regression, where
    more than two attributes are involved and the data are fit to a
    multidimensional surface.


- **iii. Outlier analysis:**

- Outliers may be detected by clustering, for example, where similar
    values are organized into groups, or “clusters.”
- Intuitively, values that fall outside of the set of clusters may be
    considered outliers.
- Noise values can be replaced with the nearest cluster mean.

### 2. DATA INTEGRATION

- The merging of data from multiple data stores.
- Yet some attributes representing a given concept may have
    different names in different databases, causing inconsistencies
    and redundancies.
- For example, the attribute for customer identification may be
    referred to as customer_id in one data store and cust_id in
    another.
- Naming inconsistencies may also occur for attribute values. For
    example, the same first name could be registered as “Bill” in
    one database, “William” in another, and “B.” in a third.
- Careful integration can help reduce and avoid redundancies and
    inconsistencies in the resulting data set.
- This can help improve the accuracy and speed of the
    subsequent data mining process

### 2.1. Entity Identification Problem


- Schema integration and object matching is an important issue in data integration.
- How can equivalent real-world entities from multiple data sources be matched up?
- This is referred to as the entity identification problem.
- For example, how can the data analyst or the computer be sure that customer_id in one database and
    cust_number in another refer to the same attribute?
- Examples of metadata for each attribute include the name, meaning, data type, and range of values
    permitted for the attribute, and null rules for handling blank, zero, or null values.
- Such metadata can be used to help avoid errors in schema integration.

### 2.2. Redundancy and Correlation Analysis


- An attribute (such as annual revenue, for instance) may be redundant if it can be “derived” from
    another attribute or set of attributes.
- Inconsistencies in attribute or dimension naming can also cause redundancies in the resulting data set.
- Some redundancies can be detected by correlation analysis.
- Given two attributes, such analysis can measure how strongly one attribute implies the other, based on
    the available data.
- For nominal data, we use the χ2 (chi-square) test.
- For numeric attributes, we can use the correlation coefficient and covariance, both of which assess
    how one attribute’s values vary from those of another.

#### 2.2.1. χ2 Correlation Test for Nominal Data

- Nominal data is a basic data type that categorizes data by labeling or naming values
    such as Gender, hair color, or types of animal.
- For nominal data, a correlation relationship between two attributes, A and B, can be
    discovered by a χ2 (chi-square) test.
- Suppose A has c distinct values, namely a1,a2,...ac .
- B has r distinct values, namely b1,b2,...br .
- The data tuples described by A and B can be shown as a contingency table, with the c
    values of A making up the columns and the r values of B making up the rows.
- Let (Ai ,Bj) denote the joint event that attribute A takes on value ai and attribute B takes
    on value bj , that is, where (A = ai ,B = bj).
- Each and every possible (Ai ,Bj) joint event has its own cell (or slot) in the table.

- The χ2 value (also known as the Pearson χ2 statistic) is computed as



- where oij is the observed frequency (i.e., actual count) of the joint event (Ai ,Bj) and eij is the expected
frequency of (Ai ,Bj), which can be computed as:




- where n is the number of data tuples, count(A = ai) is the number of tuples having value ai for A, and
    count(B = bj) is the number of tuples having value bj for B.
- The sum in χ2 value is computed over all of the r × c cells.
- Note that the cells that contribute the most to the χ2 value are those for which the actual count is very
    different from that expected.
- The χ 2 statistic tests the hypothesis that A and B are independent, that is, there is no correlation
    between them.
- If the hypothesis can be rejected, then we say that A and B are statistically correlated.

**Example 2.1 Correlation analysis of nominal attributes using χ 2 .**

Suppose that a group of 1500 people was surveyed. The gender of each person was noted. Each person
was polled as to whether his or her preferred type of reading material was fiction or nonfiction. Thus, we
have two attributes, gender and preferred reading. The observed frequency (or count) of each possible
joint event is summarized in the contingency table shown. Calculate the χ2 value for the attributes
gender and preferred reading.
male    female   Total
Fiction       250     200      450
Non-fiction   50      1000     1050
Total         300     1200     1500

**Answer:**
- The χ2 value (also known as the Pearson χ2 statistic) is computed as
    male    female   Total
    Fiction          250     200      450
    Non-fiction      50      1000     1050
- Compute the expected frequencies for each cell as:                                 Total            300     1200     1500

Actual frequencies

- For example, the expected frequency for the cell (male, fiction) is
    male   female    Total
    Fiction          90     360       450
- Notice that in any row, the sum of the expected frequencies must equal the total    Non-fiction      210    840       1050
    observed frequency for that row, and the sum of the expected frequencies in any     Total            300    1200      1500
    column must also equal the total observed frequency for that column.
    Expected frequencies

- For this 2 × 2 table, the degrees of freedom are (2 − 1)(2 − 1) = 1.
- For 1 degree of freedom, the χ 2 value needed to reject the hypothesis at the 0.001 significance
    level is 10.828 (taken from the table of upper percentage points of the χ 2 distribution,
    typically available from any textbook on statistics).
- Since our computed value is above this, we can reject the hypothesis that gender and preferred
    reading are independent and conclude that the two attributes are (strongly) correlated for the
    given group of people.

#### 2.2.2. Correlation Coefficient for Numeric Data

- For numeric attributes, we can evaluate the correlation between two attributes, A and B, by computing the
    correlation coefficient (also known as Pearson’s product moment coefficient, named after its inventor, Karl
    Pearson).


- This is:




- where n is the number of tuples, ai and bi are the respective values of A and B in tuple i, A¯ and B¯ are the
    respective mean values of A and B, σA and σB are the respective standard deviations of A and B, and ∑(aibi) is
    the sum of the AB cross-product (i.e., for each tuple, the value for A is multiplied by the value for B in that
    tuple).

- Note that −1 ≤ rA,B ≤ +1.
- If rA,B is greater than 0, then A and B are positively correlated, meaning that the values of A increase
    as the values of B increase.
- The higher the value, the stronger the correlation (i.e., the more each attribute implies the other).
- Hence, a higher value may indicate that A (or B) may be removed as a redundancy.
- If the resulting value is equal to 0, then A and B are independent and there is no correlation between
    them.
- If the resulting value is less than 0, then A and B are negatively correlated, where the values of one
    attribute increase as the values of the other attribute decrease. This means that each attribute
    discourages the other.

#### 2.2.3. Covariance of Numeric Data


- Consider two numeric attributes A and B, and a set of n observations
    {(a1,b1),...,(an,bn)}.
- The mean values of A and B, respectively, are also known as the expected values on A
    and B, that is,



- The covariance between A and B is defined as

- If we compare Equation for rA,B (correlation coefficient) with Equation for covariance, we see that



- where σA and σB are the standard deviations of A and B, respectively.
- For two attributes A and B that tend to change together, if A is larger than A¯ (the expected value of
    A), then B is likely to be larger than B¯ (the expected value of B). Therefore, the covariance between
    A and B is positive.
- On the other hand, if one of the attributes tends to be above its expected value when the other attribute
    is below its expected value, then the covariance of A and B is negative.
- If A and B are independent (i.e., they do not have correlation), therefore covariance Cov(A,B)=0

**Example 2.2 Covariance analysis of numeric attributes.**

Consider Table 3.2, which presents a simplified example of stock prices observed at five time points for
AllElectronics and HighTech, a high-tech company. If the stocks are affected by the same industry trends,
will their prices rise or fall together?




**Answer:**
Cov(AllElectroncis,HighTech) = 7
Therefore, given the positive covariance we can say that stock prices for both companies rise together.

### 2.3. Tuple Duplication

- In addition to detecting redundancies between attributes, duplication should also be detected at the
    tuple level (e.g., where there are two or more identical tuples for a given unique data entry case).
- The use of denormalized tables (often done to improve performance by avoiding joins) is another
    source of data redundancy.
- Inconsistencies often arise between various duplicates, due to inaccurate data entry or updating some
    but not all data occurrences.

### 2.4. Data Value Conflict Detection and Resolution


- Data integration also involves the detection and resolution of data value conflicts.
- For example, for the same real-world entity, attribute values from different sources may differ.
- This may be due to differences in representation, scaling, or encoding.
- For instance, a weight attribute may be stored in metric units in one system and British
    imperial units in another.
- For a hotel chain, the price of rooms in different cities may involve not only different
    currencies but also different services (e.g., free breakfast) and taxes.
- Attributes may also differ on the abstraction level, where an attribute in one system is
    recorded at, say, a lower abstraction level than the “same” attribute in another.
- For example, the total sales in one database may refer to one branch of All_Electronics, while
    an attribute of the same name in another database may refer to the total sales for
    All_Electronics stores in a given region.

### 3. DATA REDUCTION

- Data reduction techniques can be applied to obtain a reduced representation of the data set that is
    much smaller in volume, yet closely maintains the integrity of the original data.

- That is, mining on the reduced data set should be more efficient yet produce the same (or almost the
    same) analytical results.

- Data reduction strategies include
             - dimensionality reduction,
             - numerosity reduction, and
             - data compression.

Overview of Data Reduction Strategies

1.     Dimensionality reduction: is the process of reducing the number of random variables or attributes under
consideration.
                - Principal components analysis
                - Attribute subset selection
                - Wavelet transforms

2. Numerosity reduction techniques: replace the original data volume by alternative, smaller forms of data
representation.
- **a) Parametric methods: Regression and log-linear models**

- **b) Nonparametric methods: histograms, clustering, sampling, and data cube aggregation**


### 3. Data Compression: lossy and lossless

#### 3.1.1. Principal Components Analysis (also called the Karhunen-Loeve, or K-L, method)


- Imagine you have a lot of data with many different features, like height, weight, age, income, etc., and
    you want to understand it better or make predictions.
- But dealing with so many features can be complex and sometimes redundant.
- PCA, which stands for Principal Component Analysis, is like a smart way to simplify all that data
    without losing too much important information.
- Here's how it works:
    1. Find Patterns: PCA looks for patterns in your data. It tries to find which features are related to each
    other and which ones are not.
    2. Combine Features: Once it finds these relationships, PCA combines the features together in a way
    that captures as much of the important information as possible.
    3. Reduce Dimensionality: After combining features, PCA selects the most important ones and discards
    the less important ones. It's like taking a big puzzle and turning it into a smaller puzzle that still gives
    you a good idea of the big picture.
    4. Simplify Interpretation: By reducing the number of features, PCA makes it easier to understand and
    work with the data. It simplifies things without losing too much of the original meaning.

PCA - Step by step procedure
1. Standardize the Data: We first standardize the data by subtracting the mean from each feature and dividing by the standard
deviation. This step ensures that each feature has a mean of 0 and a standard deviation of 1.
2. Calculate the Covariance Matrix: Next, we compute the covariance matrix of the standardized data. This matrix tells us how
much two features vary together.




3.   Find Eigenvectors and Eigenvalues: We then find the eigenvectors (principal components) and eigenvalues of the
covariance matrix. Eigenvectors represent the directions of maximum variance, and eigenvalues represent the magnitude of
variance in those directions.
4.   Select Principal Components: We select the top k eigenvectors that correspond to the k largest eigenvalues.
5.   Transform the Data: Finally, we transform the original data into the new lower-dimensional space using the selected
principal component(s).
i.e. new feature value = (feature_vector)T * principal_component

**Example 1: Consider a dataset with two features: height (in inches) and weight (in**

pounds) of a group of people. Reduce these two dimensions (height and weight) into one
dimension using PCA.
Height     Weight
Person   (inches)   (pounds)
A        60         120
B        65         140
C        70         160
D        75         180

**Example 2: For the given dataset with features of 4 samples, reduce the feature**

dimensionality from 2 to 1.


## Sample1    Sample2    Sample3     Sample4

### X1       4          8          13         7

### X2       11         4           5        14

**EXAMPLE 3: Consider the two dimensional patterns (2, 1), (3, 5), (4, 3), (5, 6), (6, 7),**

(7, 8). Compute the principal component using PCA Algorithm and transform the pattern
(2, 1) using the principal component.

## Principal Components Analysis(Contnd.)

- Suppose that the data to be reduced consist of tuples or data vectors described by n
    attributes or dimensions.
- Principal components analysis (PCA; also called the Karhunen-Loeve, or K-L, method)
    searches for k n-dimensional orthogonal vectors that can best be used to represent the
    data, where k ≤ n.
- The original data are thus projected onto a much smaller space, resulting in
    dimensionality reduction.
- PCA “combines” the essence of attributes by creating an alternative, smaller set of
    variables.
- The initial data can then be projected onto this smaller set.

**The basic procedure is as follows:**
1.    The input data are normalized, so that each attribute falls within the same range. This step helps ensure that attributes
with large domains will not dominate attributes with smaller domains.
2.    PCA computes k orthonormal vectors that provide a basis for the normalized input data. These are unit vectors that each
point in a direction perpendicular to the others. These vectors are referred to as the principal components. The input
data are a linear combination of the principal components.
3.    The principal components are sorted in order of decreasing “significance” or strength. The principal components
essentially serve as a new set of axes for the data, providing important information about variance. That is, the sorted
axes are such that the first axis shows the most variance among the data, the second axis shows the next highest
variance, and so on.
4.    Because the components are sorted in decreasing order of “significance,” the data size can be reduced by eliminating
the weaker components, that is, those with low variance. Using the strongest principal components, it should be
possible to reconstruct a good approximation of the original data.

#### 3.1.2. Attribute Subset Selection


- Attribute subset selection reduces the data set size by removing irrelevant or redundant attributes (or
    dimensions).
- The goal of attribute subset selection is to find a minimum set of attributes such that the resulting
    probability distribution of the data classes is as close as possible to the original distribution obtained
    using all attributes.
    “How can we find a ‘good’ subset of the original attributes?”
- For n attributes, there are 2n possible subsets.
- An exhaustive search for the optimal subset of attributes can be prohibitively expensive, especially as n
    and the number of data classes increase.
- Therefore, heuristic methods that explore a reduced search space are commonly used for attribute
    subset selection.
- These methods are typically greedy in that, while searching through attribute space, they always make
    what looks to be the best choice at the time.
- Their strategy is to make a locally optimal choice in the hope that this will lead to a globally optimal
    solution.

- The “best” (and “worst”) attributes are typically determined using statistical tests, which assume that
    the attributes are independent of one another.

- Many other attribute evaluation measures can be used such as the information gain measure used in
    building decision trees for classification.

- Basic heuristic methods of attribute subset selection include:

- **a) Stepwise forward selection**

- **b) Stepwise backward elimination**

- **c) Combination of forward selection and backward elimination:**

- **d) Decision tree induction**

- **a) Stepwise forward selection:**

- The procedure starts with an empty set of attributes as the reduced set.
- The best of the original attributes is determined and added to the reduced
    set.
- At each subsequent iteration or step, the best of the remaining original
    attributes is added to the set.


- **b) Stepwise backward elimination:**

- The procedure starts with the full set of attributes.
- At each step, it removes the worst attribute remaining in the set.


- **c) Combination of forward selection and backward elimination:**

- The stepwise forward selection and backward elimination methods can be
    combined so that, at each step, the procedure selects the best attribute and
    removes the worst from among the remaining attributes.

- **d) Decision tree induction:**

- Decision tree algorithms (e.g., ID3, C4.5, and CART) were
    originally intended for classification.
- Decision tree induction constructs a flowchart like structure
    where each internal (non-leaf) node denotes a test on an attribute,
    each branch corresponds to an outcome of the test, and each
    external (leaf) node denotes a class prediction.
- At each node, the algorithm chooses the “best” attribute to
    partition the data into individual classes.
- When decision tree induction is used for attribute subset
    selection, a tree is constructed from the given data.
- All attributes that do not appear in the tree are assumed to be
    irrelevant.
- The set of attributes appearing in the tree form the reduced subset
    of attributes.

#### 3.1.2 Wavelet Transforms


- The discrete wavelet transform (DWT) is a signal processing technique that, when
    applied to a data vector X, transforms it to a numerically different vector, X’, of wavelet
    coefficients.
- The two vectors are of the same length.
- When applying this technique to data reduction, we consider each tuple as an n-
    dimensional data vector, that is, X = (x1,x2,...,xn), depicting n measurements made on
    the tuple from n database attributes.
- “How can this technique be useful for data reduction if the wavelet transformed data
    are of the same length as the original data?”

Advantages of DWT

- The usefulness lies in the fact that the wavelet transformed data can be truncated.
- A compressed approximation of the data can be retained by storing only a small fraction of the
    strongest of the wavelet coefficients.
- For example, all wavelet coefficients larger than some user-specified threshold can be retained. All
    other coefficients are set to 0.
- The resulting data representation is therefore very sparse, so that operations that can take advantage of
    data sparsity are computationally very fast if performed in wavelet space.
- Given a set of coefficients, an approximation of the original data can be constructed by applying the
    inverse of the DWT used.

- The general procedure for applying a discrete wavelet transform uses a hierarchical pyramid algorithm that halves the
    data at each iteration, resulting in fast computational speed.
- The method is as follows:
    1.   The length, L, of the input data vector must be an integer power of 2. This condition can be met by padding the data
    vector with zeros as necessary (L ≥ n).
### 2.   Each transform involves applying two functions:

a) The first applies some data smoothing, such as a sum or weighted average.
b) The second performs a weighted difference, which acts to bring out the detailed features of the data.
3.   The two functions are applied to pairs of data points in X, that is, to all pairs of measurements (x2i ,x2i+1). This results in
two data sets of length L/2. In general, these represent a smoothed or low-frequency version of the input data and the
high frequency content of it, respectively.
4.   The two functions are recursively applied to the data sets obtained in the previous loop, until the resulting data sets
obtained are of length 2.
5.   Selected values from the data sets obtained in the previous iterations are designated the wavelet coefficients of the
transformed data.

**Example: Compute the DWT coefficients of the vector [1,2,3,4,5,6,7,8,9].    Level 3 Decomposition:**

Answer:                                                                     Length of vector is odd, padding with zeros: [2.5, 6.5, 2.25,0]
Length of vector is odd, padding with zeros: [1,2,3,4,5,6,7,8,9,0].
                                                                            - Approximation Coefficients (A3):
    Level 1 Decomposition:                                                      [(2.5+6.5)/2] = [4.5]
- Approximation Coefficients (A1):                                          -Detail Coefficients (D3):
    [6.5-2.5] = [4]
    [(1+2)/2, (3+4)/2, (5+6)/2, (7+8)/2, (9+0)/2] = [1.5, 3.5, 5.5, 7.5, 4.5]
- Detail Coefficients (D1):                                                 Therefore, the DWT coefficients for the given vector
    [2-1, 4-3, 6-5, 8-7, 0-9] = [1, 1, 1, 1, -9]                                [1,2,3,4,5,6,7,8,9] using DWT with three levels of decomposition
**are:**
## Level 2 Decomposition:                                                      -Approximation Coefficients:

Length of vector is odd, padding with zeros: [1.5, 3.5, 5.5, 7.5, 4.5,0]        - A3: [4.5]
                                                                                - A2: [2.5, 6.5, 2.25]
- Approximation Coefficients (A2):                                              - A1: [1.5, 3.5, 5.5, 7.5, 4.5]
    [(1.5+3.5)/2, (5.5+7.5)/2, (4.5+0)/2] = [2.5, 6.5, 2.25]
                                                                            - Detail Coefficients:
- Detail Coefficients (D2):
                                                                                 - D3: [4]
    [3.5-1.5, 7.5-5.5, 0-4.5] = [2, 2, -2.25]                                        - D2: [2, 2, -2.25]
                                                                                 - D1: [1, 1, 1, 1, -9]

### 3.2. Numerosity Reduction


- Numerosity reduction techniques replace the original data volume by alternative, smaller forms of data
    representation.

- These techniques may be parametric or nonparametric.

A. Parametric methods: Use a model to estimate the data, so that typically only the data parameters
need to be stored, instead of the actual data. Regression and log-linear models are examples.

#### B. Nonparametric methods: include histograms, clustering, sampling, and data cube aggregation.

#### 3.2.1 Regression Models: Parametric Data Reduction


- In (simple) linear regression, the data are modeled to fit a straight line.
- For example, a random variable, y (called a response variable), can be modeled as a linear function of
    another random variable, x (called a predictor variable), with the equation
    y = wx + b,
- In the context of data mining, x and y are numeric database attributes.
- The coefficients, w and b (called regression coefficients), specify the slope of the line and the y-
    intercept, respectively.
- These coefficients can be solved for by the method of least squares, which minimizes the error
    between the actual line separating the data and the estimate of the line.
- Multiple linear regression is an extension of (simple) linear regression, which allows a response
    variable, y, to be modeled as a linear function of two or more predictor variables.

**Example 1: for the given dataset, build a linear regression model to predict Y based on X.**

### X               Y

(independent    (dependent
variable)       variable)
1              2

2              3

3              4

4              5


**Answer:                                          5              6**


- The linear regression model has the form:
    Y=β0+β1⋅X
**where:**
- Y is the dependent variable (what we want to predict).
- X is the independent variable (the feature we're using for prediction).
- β0 is the intercept (the value of Y when X is 0).
- β1 is the slope (the change in Y for a unit change in X).
- Now, let's compute the coefficients β0 and β1 step by step.

## Step 1: Calculate Means

- Calculate the means of X (Xˉ) and Y (Yˉ):
- Xˉ=1+2+3+4+5 / = 3
- Yˉ=2+3+4+5+6 / 5= 4


Step 2: Calculate β1 (Slope)
- Calculate β1 using the formula:


- Substitute the values:

Step 3: Calculate β0 (Intercept)
- Use the calculated β1 to calculate β0 using the formula:




Step 4: Build the Linear Regression Equation
- Now that we have β0 and β1, we can write the linear regression equation:
    Y=1+1⋅X
- So, the equation for our linear regression model is:
    Y=X+1
- This equation can be used to predict the value of Y for any given value of X.

**Example 2: for the given dataset, build a linear regression model to predict Y based on**

X.
- x = [1, 2, 3, 4, 5] # Independent variable (features)
- y = [2, 4, 5, 4, 6] # Dependent variable (target)

**Answer:**
y = 0.8x + 1.8

#### 3.2.2 Log Linear Models: Parametric Data Reduction


- Log-linear models are statistical models used for analyzing categorical data.
- They are particularly useful for understanding relationships between categorical variables and making
    predictions based on these relationships.
- Imagine you have a dataset with different categorical variables, like the type of car someone drives
    (sedan, SUV, truck), their income level (low, medium, high), and whether they own a pet (yes, no).
- Log-linear models help us understand how these variables are related to each other.

#### 3.2.3. Histograms: Non-Parametric Data Reduction


- Histograms use binning to approximate data distributions and are a popular form of data
    reduction.
- A histogram for an attribute, A, partitions the data distribution of A into disjoint
    subsets, referred to as buckets or bins.
- If each bucket represents only a single attribute–value/frequency pair, the buckets are
    called singleton buckets.
- Often, buckets instead represent continuous ranges for the given attribute

**Example: Histograms**

- The following data are a list of AllElectronics prices for
    commonly sold items (rounded to the nearest dollar).
- The numbers have been sorted: 1, 1, 5, 5, 5, 5, 5, 8, 8,
    10, 10, 10, 10, 12, 14, 14, 14, 15, 15, 15, 15, 15, 15, 18,
    18, 18, 18, 18, 18, 18, 18, 20, 20, 20, 20, 20, 20, 20, 21,   Figure 3.7 A histogram for price using singleton buckets—each
    bucket represents one price–value/ frequency pair.
    21, 21, 21, 25, 25, 25, 25, 25, 28, 28, 30, 30, 30.
- Figure 3.7 shows a histogram for the data using
    singleton buckets.
- To further reduce the data, it is common to have each
    bucket denote a continuous value range for the given
    attribute.
- In Figure 3.8, each bucket represents a different $10          Figure 3.8 An equal-width histogram for price,
    where values are aggregated so that each bucket
    range for price.                                               has a uniform width of $10.

“How are the buckets determined and the attribute values partitioned?”

## There are several partitioning rules, including the following:


i.    Equal-width: In an equal-width histogram, the width of each bucket range is
uniform (e.g., the width of $10 for the buckets in Figure 3.8).

- **ii.   Equal-frequency (or equal-depth): In an equal-frequency histogram, the buckets**

are created so that, roughly, the frequency of each bucket is constant (i.e., each
bucket contains roughly the same number of contiguous data samples).

#### 3.2.4 Clustering: Non-Parametric Data Reduction

- Clustering techniques consider data tuples as objects.
- They partition the objects into groups, or clusters, so that objects within a cluster are
    “similar” to one another and “dissimilar” to objects in other clusters.
- Similarity is commonly defined in terms of how “close” the objects are in space,
    based on a distance function.
- The “quality” of a cluster may be represented by its diameter, the maximum distance
    between any two objects in the cluster.
- Centroid distance is an alternative measure of cluster quality and is defined as the
    average distance of each cluster object from the cluster centroid (denoting the
    “average object,” or average point in space for the cluster).
- Figure 3.3 showed a 2-D plot of customer data with respect to customer locations in
    a city.
- Three data clusters are visible.
    Figure 3.3 A 2-D customer data plot with respect to
- In data reduction, the cluster representations of the data are used to replace the actual
    customer locations in a city, showing three data clusters.
    data.
    Outliers may be detected as values that fall outside of the
- The effectiveness of this technique depends on the data’s nature.                           cluster sets
- It is much more effective for data that can be organized into distinct clusters than for
    smeared data.

#### 3.2.5. Sampling

- Sampling can be used as a data reduction technique because it allows a large data
    set to be represented by a much smaller random data sample (or subset).
- Suppose that a large data set, D, contains N tuples.
- Let’s look at the most common ways that we could sample D for data reduction:


### 1.   Simple random sample without replacement (SRSWOR) of size s: This is

created by drawing s of the N tuples from D (s < N), where the probability of
drawing any tuple in D is 1/N, that is, all tuples are equally likely to be
sampled.


### 2.   Simple random sample with replacement (SRSWR) of size s: This is

similar to SRSWOR, except that each time a tuple is drawn from D, it is
recorded and then replaced. That is, after a tuple is drawn, it is placed back in
D so that it may be drawn again.

3. Cluster sample: If the tuples in D are grouped into M mutually disjoint
“clusters,” then an SRS of s clusters can be obtained, where s < M. For
example, tuples in a database are usually retrieved a page at a time, so that
each page can be considered a cluster. A reduced data representation can be
obtained by applying, say, SRSWOR to the pages, resulting in a cluster
sample of the tuples.




### 4. Stratified sample: If D is divided into mutually disjoint parts called

strata, a stratified sample of D is generated by obtaining an SRS at each
stratum. This helps ensure a representative sample, especially when the data
are skewed. For example, a stratified sample may be obtained from customer
data, where a stratum is created for each customer age group. In this way,
the age group having the smallest number of customers will be sure to be
represented.

#### 3.2.6. Data cube aggregation


- Imagine that you have collected the data for your analysis.
- These data consist of the AllElectronics sales per quarter,
    for the years 2008 to 2010.
- You are, however, interested in the annual sales (total per
    year), rather than the total per quarter.
- Thus, the data can be aggregated so that the resulting data
    summarize the total sales per year instead of per quarter.     Figure 3.10: Sales data for a given branch of
- This aggregation is illustrated in Figure 3.10.                AllElectronics for the years 2008 through 2010. On
    the left, the sales are shown per quarter. On the right,
- The resulting data set is smaller in volume, without loss of   the data are aggregated to provide the annual sales.
    information necessary for the analysis task.

- Data cubes store multidimensional aggregated information.
- For example, Figure 3.11 shows a data cube for multidimensional analysis of sales data
    with respect to annual sales per item type for each AllElectronics branch.
- Each cell holds an aggregate data value, corresponding to the data point in
    multidimensional space. (For readability, only some cell values are shown.)
- Concept hierarchies may exist for each attribute, allowing the analysis of data at multiple
    abstraction levels.
- For example, a hierarchy for branch could allow branches to be grouped into regions, based
    on their address.
- The cube created at the lowest abstraction level is referred to as the base cuboid.
- The base cuboid should correspond to an individual entity of interest such as sales or
    customer.
- In other words, the lowest level should be usable, or useful for the analysis.
- A cube at the highest level of abstraction is the apex cuboid.
- For the sales data in Figure 3.11,the apex cuboid would give one total—the total sales for
    all three years, for all item types, and for all branches.
- Data cubes created for varying levels of abstraction are often referred to as cuboids, so that
    a data cube may instead refer to a lattice of cuboids.

### 4. DATA TRANSFORMATION

- Strategies for data transformation include the following:
    1. Smoothing: to remove noise from the data. Techniques include binning, regression, and clustering.
    2. Attribute construction (or feature construction): new attributes are constructed and added from the
    given set of attributes
    3. Aggregation: summary or aggregation operations are applied to the data. For example, the daily sales
    data may be aggregated so as to compute monthly and annual total amounts. This step is typically used
    in constructing a data cube for data analysis at multiple abstraction levels.
    4. Normalization: the attribute data are scaled so as to fall within a smaller range, such as −1.0 to 1.0, or
    0.0 to 1.0.
    5. Discretization: the raw values of a numeric attribute (e.g., age) are replaced by interval labels (e.g.,
    0–10, 11–20, etc.) or conceptual labels (e.g., youth, adult, senior).
    6. Concept hierarchy generation for nominal data: attributes such as street can be generalized to
    higher-level concepts, like city or country. Many hierarchies for nominal attributes are implicit within
    the database schema and can be automatically defined at the schema definition level.

Recall that there is much overlap between the major data preprocessing tasks.

The first three of these strategies were discussed earlier

### 4.4. Data Transformation by Normalization

- The measurement unit used can affect the data analysis.
- For example, changing measurement units from meters to inches for height, or from kilograms to pounds for weight, may
    lead to very different results.
- In general, expressing an attribute in smaller units will lead to a larger range for that attribute, and thus tend to give such an
    attribute greater effect or “weight.”
- To help avoid dependence on the choice of measurement units, the data should be normalized.
- This involves transforming the data to fall within a smaller or common range such as [−1,1] or [0.0, 1.0].
- Normalizing the data attempts to give all attributes an equal weight.
- Normalization is particularly useful for classification algorithms involving neural networks or distance measurements such
    as nearest-neighbor classification and clustering.
- If using the neural network backpropagation algorithm for classification mining, normalizing the input values for each
    attribute measured in the training tuples will help speed up the learning phase.
- For distance-based methods, normalization helps prevent attributes with initially large ranges (e.g., income) from
    outweighing attributes with initially smaller ranges (e.g., binary attributes).

- Methods for data normalization:

- **a) min-max normalization,**

- **b) z-score normalization, and**

- **c) normalization by decimal scaling.**


Let A be a numeric attribute with n observed values, v1, v2,..., vn.

- **a) Min-max Normalization:**

- Min-max normalization performs a linear transformation on the original data.
- Suppose that minA and maxA are the minimum and maximum values of an attribute, A.
- Min-max normalization maps a value, vi , of A to v’i in the range [new_minA, new_maxA] by
    computing




**Example: Suppose that the minimum and maximum values for the attribute income are $12,000 and**

$98,000, respectively. We would like to map income to the range [0.0,1.0]. By min-max normalization,
transform a value of $73,600 for income.

**Answer: 0.716**

- **b) Z-score normalization (or zero-mean normalization):**

- The values for an attribute, A, are normalized based on the mean (i.e., average) and standard deviation of A.
- A value, vi , of A is normalized to v’i by computing:



where A¯ and σA are the mean and standard deviation, respectively, of attribute A.
- This method of normalization is useful when the actual minimum and maximum of attribute A are unknown, or
    when there are outliers that dominate the min-max normalization.


**Example: Suppose that the mean and standard deviation of the values for the attribute income are $54,000 and**

$16,000, respectively. With z-score normalization, transform the value of $73,600 for income.


**Answer: 1.225**

- **c) Normalization by decimal scaling:**

- normalizes by moving the decimal point of values of attribute A.
- The number of decimal points moved depends on the maximum absolute value of A.
- A value, vi , of A is normalized to v’i by computing



where j is the smallest integer such that max(| v’i |) < 1.

**Example: Suppose that the recorded values of A range from −986 to 917. The maximum absolute value**

of A is 986. To normalize by decimal scaling, we therefore divide each value by 1000 (i.e., j = 3) so that
−986 normalizes to −0.986 and 917 normalizes to 0.917.
